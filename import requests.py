import requests

# Define the URL to send the request to
url = 'http://localhost:4000/pythonrequest'

# Send a GET request to the URL
response = requests.get(url)

# Print the status code of the response
print(f"Status Code: {response.status_code}")

# Print the response body
print("Response Body:")
response.json()
