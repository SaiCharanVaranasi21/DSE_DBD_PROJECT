from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import logging
import os

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api-gateway")

app = FastAPI(
    title="Money Manager API Gateway",
    description="API Gateway routing requests to Spring Boot backend and Node.js transaction microservice.",
    version="1.0.0"
)

# CORS middleware config for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Downstream services URL variables (read from environment for production)
SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8081")
NODE_SERVICE_URL = os.getenv("NODE_SERVICE_URL", "http://localhost:5000")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"[{request.method}] {request.url.path} - Status: {response.status_code} - Latency: {duration:.4f}s")
    return response

# Header extractor utility
def get_forward_headers(request: Request):
    headers = {}
    auth = request.headers.get("authorization")
    if auth:
        headers["Authorization"] = auth
    token = request.headers.get("token")
    if token:
        headers["Token"] = token
    return headers

# Central request forwarder with timeout and connection error boundaries
def forward_request(method: str, url: str, json_data=None, params=None, headers=None, timeout=30.0):
    try:
        if method == "GET":
            res = requests.get(url, params=params, headers=headers, timeout=timeout)
        elif method == "POST":
            res = requests.post(url, json=json_data, headers=headers, timeout=timeout)
        elif method == "PUT":
            res = requests.put(url, json=json_data, headers=headers, timeout=timeout)
        elif method == "DELETE":
            res = requests.delete(url, headers=headers, timeout=timeout)
        else:
            return {"error": "Unsupported HTTP method"}, 405
            
        try:
            return res.json(), res.status_code
        except Exception:
            return {"text": res.text}, res.status_code
            
    except requests.exceptions.Timeout:
        logger.error(f"Timeout occurred while forwarding {method} to {url}")
        return {"error": "Gateway Timeout: Downstream service took too long to respond"}, 504
    except requests.exceptions.ConnectionError:
        logger.error(f"Connection error occurred while connecting to {url}")
        return {"error": "Bad Gateway: Downstream service is unreachable"}, 502
    except Exception as e:
        logger.error(f"Error forwarding request: {str(e)}")
        return {"error": f"Internal Server Error: {str(e)}"}, 500

# ==========================================
# UNIFIED NEW API ENDPOINTS (/api/*)
# ==========================================

# --- Auth Endpoints ---
@app.post("/api/auth/signup")
async def api_signup(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/signup", json_data=body)
    response.status_code = code
    return data

@app.post("/api/auth/signin")
async def api_signin(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/signin", json_data=body)
    response.status_code = code
    return data

@app.post("/api/auth/change-password")
async def api_change_password(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/change-password", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

# --- Users Endpoints ---
@app.get("/api/users")
def api_get_users(request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/users", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/api/users/{id}")
def api_get_user(id: int, request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/users/{id}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.delete("/api/users/{id}")
def api_delete_user(id: int, request: Request, response: Response):
    data, code = forward_request("DELETE", f"{SPRING_BOOT_URL}/authservice/users/{id}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.put("/api/users/{id}/complete-onboarding")
async def api_complete_onboarding(id: int, request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("PUT", f"{SPRING_BOOT_URL}/authservice/users/{id}/complete-onboarding", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/api/users/uinfo")
def api_get_uinfo(request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/uinfo", headers=get_forward_headers(request))
    response.status_code = code
    return data

# --- Transaction Endpoints (Forwards to Node.js microservice) ---
@app.post("/api/transactions")
async def api_create_transaction(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{NODE_SERVICE_URL}/transactions", json_data=body)
    response.status_code = code
    return data

@app.get("/api/transactions")
def api_get_transactions(request: Request, response: Response):
    params = dict(request.query_params)
    data, code = forward_request("GET", f"{NODE_SERVICE_URL}/transactions", params=params)
    response.status_code = code
    return data

@app.put("/api/transactions/{id}")
async def api_update_transaction(id: str, request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("PUT", f"{NODE_SERVICE_URL}/transactions/{id}", json_data=body)
    response.status_code = code
    return data

@app.delete("/api/transactions/{id}")
def api_delete_transaction(id: str, request: Request, response: Response):
    data, code = forward_request("DELETE", f"{NODE_SERVICE_URL}/transactions/{id}")
    response.status_code = code
    return data

# --- Category Endpoints (Forwards to Node.js microservice) ---
@app.get("/api/categories")
def api_get_categories(response: Response):
    data, code = forward_request("GET", f"{NODE_SERVICE_URL}/categories")
    response.status_code = code
    return data

# --- Budget Endpoints (Forwards to Spring Boot) ---
@app.get("/api/budgets/user/{userId}")
def api_get_budgets(userId: int, request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/budgets/user/{userId}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/api/budgets/user/{userId}/{month}")
def api_get_budgets_by_month(userId: int, month: str, request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/budgets/user/{userId}/{month}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/api/budgets/save")
async def api_save_budget(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/budgets/save", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.delete("/api/budgets/delete/{id}")
def api_delete_budget(id: int, request: Request, response: Response):
    data, code = forward_request("DELETE", f"{SPRING_BOOT_URL}/budgets/delete/{id}", headers=get_forward_headers(request))
    response.status_code = code
    return data

# --- Report Endpoints (Forwards to Spring Boot) ---
@app.get("/api/reports/user/{userId}")
def api_get_reports(userId: int, request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/reports/user/{userId}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/api/reports/user/{userId}/{month}")
def api_get_reports_by_month(userId: int, month: str, request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/reports/user/{userId}/{month}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/api/reports/save")
async def api_save_report(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/reports/save", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.delete("/api/reports/delete/{id}")
def api_delete_report(id: int, request: Request, response: Response):
    data, code = forward_request("DELETE", f"{SPRING_BOOT_URL}/reports/delete/{id}", headers=get_forward_headers(request))
    response.status_code = code
    return data
# --- Admin MongoDB Collections Proxy routes ---
@app.get("/api/admin/mongo/expense_logs")
def api_admin_expense_logs(request: Request, response: Response):
    params = dict(request.query_params)
    data, code = forward_request("GET", f"{NODE_SERVICE_URL}/admin/mongo/expense_logs", params=params)
    response.status_code = code
    return data

@app.get("/api/admin/mongo/expense_embeddings")
def api_admin_expense_embeddings(request: Request, response: Response):
    params = dict(request.query_params)
    data, code = forward_request("GET", f"{NODE_SERVICE_URL}/admin/mongo/expense_embeddings", params=params)
    response.status_code = code
    return data

@app.get("/api/admin/mongo/user_activity")
def api_admin_user_activity(request: Request, response: Response):
    params = dict(request.query_params)
    data, code = forward_request("GET", f"{NODE_SERVICE_URL}/admin/mongo/user_activity", params=params)
    response.status_code = code
    return data


# ==========================================
# BACKWARD COMPATIBLE LEGACY ROUTES
# ==========================================

@app.post("/authservice/signup")
async def signup(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/signup", json_data=body)
    response.status_code = code
    return data

@app.post("/authservice/signin")
async def signin(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/signin", json_data=body)
    response.status_code = code
    return data

@app.get("/authservice/users")
def get_users(request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/users", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/authservice/users/{id}")
def get_user(id: int, request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/users/{id}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.put("/authservice/users/{id}/complete-onboarding")
async def complete_onboarding(id: int, request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("PUT", f"{SPRING_BOOT_URL}/authservice/users/{id}/complete-onboarding", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/authservice/uinfo")
def get_uinfo(request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/uinfo", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/financial/{user_id}")
def get_financial_profile(user_id: int, request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/financial/{user_id}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/financial/save")
async def save_financial_profile(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/financial/save", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.put("/financial/update/{user_id}")
async def update_financial_profile(user_id: int, request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("PUT", f"{SPRING_BOOT_URL}/financial/update/{user_id}", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/taskservice/tasks")
async def add_task(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/taskservice/tasks", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/taskservice/tasks")
def get_tasks(request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/taskservice/tasks", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.delete("/taskservice/tasks/{id}")
def delete_task(id: int, request: Request, response: Response):
    data, code = forward_request("DELETE", f"{SPRING_BOOT_URL}/taskservice/tasks/{id}", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.put("/taskservice/tasks/{id}")
async def update_task(id: int, request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("PUT", f"{SPRING_BOOT_URL}/taskservice/tasks/{id}", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/authservice/roles")
async def add_role(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/roles", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/authservice/roles")
def get_roles(request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/roles", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/authservice/menus")
async def add_menu(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/menus", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.get("/authservice/menus")
def get_menus(request: Request, response: Response):
    data, code = forward_request("GET", f"{SPRING_BOOT_URL}/authservice/menus", headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/authservice/rolesmapping")
async def add_role_menu_mapping(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/rolesmapping", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data

@app.post("/authservice/change-password")
async def legacy_change_password(request: Request, response: Response):
    body = await request.json()
    data, code = forward_request("POST", f"{SPRING_BOOT_URL}/authservice/change-password", json_data=body, headers=get_forward_headers(request))
    response.status_code = code
    return data
