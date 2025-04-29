import requests

url = "https://api.avantos-dev.io/api/v1/123/actions/blueprints/bp_456/bpv_123/graph"
headers = {
    "Accept": "application/json, application/problem+json"
}

response = requests.get(url, headers=headers)

print(response.status_code)
print(response.json())
