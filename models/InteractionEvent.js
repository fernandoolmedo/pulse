// models/InteractionEvent.js
const mongoose = require('mongoose');

const EVENT_TYPES = [
  'view_post',        // user viewed a post
  'view_reactions',   // user opened the reactions panel
  'react_post',       // user set or changed a reaction
  'create_post',      // user published a new post
  'delete_post',      // user deleted a post
  'view_feed',        // user loaded the home feed
  'register',         // new user signed up
  'login',            // user logged in
  'logout',           // user logged out
];
// NOTE: `exports.X = ...` is pointless in this file — module.exports is
// reassigned to the model at the bottom, which discards it. EVENT_TYPES and
// coerceMetadata are attached to the model export instead.

// Using strict sub-schemas instead of Mixed:
//   - Mongoose validates the shape at write time
//   - BigQuery receives consistent, predictable column structures
//   - dbt Silver models can reference specific fields reliably
// Each event type gets exactly the metadata fields it needs, nothing more.
const viewPostMetaSchema = new mongoose.Schema({
  category:    { type: String, default: null },  // from post.category
  hasImage:    { type: Boolean, default: null },
  hasReaction: { type: Boolean, default: null }, // did viewer already react
}, { _id: false });

const viewReactionsMetaSchema = new mongoose.Schema({
  myEmoji:  { type: String, default: null },
  category: { type: String, default: null },  // from post.category
}, { _id: false });

const reactPostMetaSchema = new mongoose.Schema({
  newEmoji:  { type: String, default: null },
  prevEmoji: { type: String, default: null },  // null = first reaction
  category:  { type: String, default: null },  // from post.category
}, { _id: false });

const createPostMetaSchema = new mongoose.Schema({
  category: { type: String, default: null },
  hasImage: { type: Boolean, default: null },
  tagsCount: { type: Number, default: 0 },
}, { _id: false });

const viewFeedMetaSchema = new mongoose.Schema({
  postCount: { type: Number, default: null },  // how many posts were in the feed
}, { _id: false });

// Map from eventType string → its metadata sub-schema
// Used in the pre-validate hook below to enforce the right shape
const META_SCHEMAS = {
  view_post:      viewPostMetaSchema,
  view_reactions: viewReactionsMetaSchema,
  react_post:     reactPostMetaSchema,
  create_post:    createPostMetaSchema,
  view_feed:      viewFeedMetaSchema,
  // Events with no structured metadata (login, logout, etc.) get {}
};

// Coerce a raw metadata object into exactly the shape META_SCHEMAS declares
// for this event type:
//   - unknown keys are dropped (same as a strict sub-schema would)
//   - missing keys are filled with the sub-schema's default
//   - present keys are cast, throwing CastError on a type mismatch
// Attached to the model export for unit testing; the pre-validate hook below
// is the only caller in production.
function coerceMetadata(eventType, metadata) {
  const schema = META_SCHEMAS[eventType];
  if (!schema) return {};

  const out = {};
  for (const [pathName, schemaType] of Object.entries(schema.paths)) {
    const raw = metadata == null ? undefined : metadata[pathName];
    out[pathName] = raw == null ? schemaType.getDefault() : schemaType.cast(raw);
  }
  return out;
}

const interactionEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },

    // anonymousId = express-session cookie ID.
    // Tracks the same browser across requests, even before login.
    // After login, userId links the anonymous history to a real user.
    anonymousId: {
      type: String,
      index: true,
      default: null,
    },

    // This is the field that groups events into a single visit for:
    //   - Analytics: session depth, bounce rate, funnel steps
    //   - ML: behavioral sequence modeling (what did the user do in one sitting?)
    sessionId: {
      type: String,
      index: true,
      default: null,
    },

    // A typo at the call site will now throw a ValidationError immediately
    // instead of creating a garbage event type in your data.
    eventType: {
      type: String,
      required: true,
      enum: EVENT_TYPES,
      index: true,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      index: true,
      default: null,
    },

    route:     { type: String, default: null },
    method:    { type: String, default: null },
    userAgent: { type: String, default: null },

    ip: { type: String, default: null },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    // createdAt only — interaction events are immutable, no updatedAt needed.
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for the most common analytics and ML query pattern:
// "give me all events for this user, on this post, of this type, ordered by time"
interactionEventSchema.index({
  userId: 1,
  postId: 1,
  eventType: 1,
  createdAt: -1,
});

// "give me all events in this session ordered by time"
// This is the core query for session replay and sequence modeling.
interactionEventSchema.index({
  sessionId: 1,
  createdAt: 1,
});

// Enforce the per-event-type metadata shape this file has always documented.
// Without it `metadata` was a free-form Object and the sub-schemas above were
// dead code, so a typo at a call site silently produced a garbage column.
// A CastError here rejects the create(); logEvent is fire-and-forget and
// counts the drop, so a bad event never breaks the request that produced it.
interactionEventSchema.pre('validate', function (next) {
  try {
    this.metadata = coerceMetadata(this.eventType, this.metadata);
    next();
  } catch (err) {
    next(err);
  }
});

const InteractionEvent = mongoose.model('InteractionEvent', interactionEventSchema);

InteractionEvent.EVENT_TYPES = EVENT_TYPES;
InteractionEvent.coerceMetadata = coerceMetadata;

module.exports = InteractionEvent;