"""
Live Production Verification Script
Target Backend: https://skill2career-backend.onrender.com/api/v1
"""

import sys
import uuid
import requests

BASE_URL = "https://skill2career-backend.onrender.com/api/v1"

def run_production_e2e_audit():
    print("=" * 60)
    print("LIVE PRODUCTION E2E AUDIT STARTING")
    print(f"Target API: {BASE_URL}")
    print("=" * 60)

    # 1. Health check
    health_res = requests.get("https://skill2career-backend.onrender.com/api/health", timeout=15)
    print(f"[1] Health Check: Status {health_res.status_code}")
    print(f"    Payload: {health_res.json()}")
    assert health_res.status_code == 200

    # 2. Register completely fresh new student
    suffix = uuid.uuid4().hex[:8]
    fresh_email = f"live_fresh_{suffix}@skill2career-test.com"
    fresh_password = "SecurePassword123!"
    fresh_name = f"Live Audit Student {suffix}"

    print(f"\n[2] Registering fresh user: {fresh_email}")
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": fresh_email,
        "password": fresh_password,
        "full_name": fresh_name,
        "role": "student"
    }, timeout=15)
    print(f"    Register Status: {reg_res.status_code}")
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    token = reg_data["access_token"]
    user_id = reg_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"    Created User ID: {user_id}")

    # 3. Verify 0 skills, 0 projects, 0 certs, no target career, 0 hours, 0 velocity
    print("\n[3] Verifying initial empty profile state...")
    prof_res = requests.get(f"{BASE_URL}/student/profile", headers=headers, timeout=15)
    assert prof_res.status_code == 200, f"Get profile failed: {prof_res.text}"
    prof = prof_res.json()
    print(f"    Full Name: {prof.get('full_name')}")
    print(f"    Target Career: {prof.get('target_career_id')} (Expected: None)")
    print(f"    Weekly Study Hours: {prof.get('weekly_study_hours')} (Expected: 0.0)")
    print(f"    Learning Velocity: {prof.get('learning_velocity_index')} (Expected: 0.0)")
    print(f"    Skills Count: {len(prof.get('skills', []))} (Expected: 0)")
    print(f"    Projects Count: {prof.get('projects_count')} (Expected: 0)")
    print(f"    Certifications Count: {prof.get('certifications_count')} (Expected: 0)")

    assert prof.get("target_career_id") is None
    assert prof.get("target_career_title") is None
    assert prof.get("weekly_study_hours") == 0.0
    assert prof.get("learning_velocity_index") == 0.0
    assert len(prof.get("skills", [])) == 0
    assert prof.get("projects_count") == 0
    assert prof.get("certifications_count") == 0

    # 4. Verify no fabricated readiness score without career
    print("\n[4] Verifying no fabricated readiness without target career...")
    ready_res = requests.post(f"{BASE_URL}/analysis/readiness", headers=headers, json={}, timeout=15)
    print(f"    Readiness Status (No Career): {ready_res.status_code} (Expected: 400)")
    assert ready_res.status_code == 400, f"Expected 400, got: {ready_res.status_code} {ready_res.text}"
    print(f"    Detail: {ready_res.json().get('detail')}")

    # 5. Verify no fabricated roadmap without career
    print("\n[5] Verifying roadmap returns 400 without target career...")
    roadmap_res = requests.get(f"{BASE_URL}/roadmap/current", headers=headers, timeout=15)
    print(f"    Roadmap Status (No Career): {roadmap_res.status_code} (Expected: 400)")
    assert roadmap_res.status_code == 400

    # 6. Verify Learning Intelligence reports INSUFFICIENT_HISTORY
    print("\n[6] Verifying Learning Intelligence reports INSUFFICIENT_HISTORY...")
    li_res = requests.get(f"{BASE_URL}/learning-intelligence/overview", headers=headers, timeout=15)
    assert li_res.status_code == 200, f"LI overview failed: {li_res.text}"
    li_data = li_res.json()
    print(f"    Velocity Status: {li_data.get('velocity', {}).get('status')} (Expected: INSUFFICIENT_HISTORY)")
    print(f"    Velocity Value: {li_data.get('velocity', {}).get('overall_learning_velocity')} (Expected: 0.0)")
    assert li_data.get("velocity", {}).get("status") == "INSUFFICIENT_HISTORY"

    # 7. Explicitly select a target career (e.g. CR001) and update profile
    print("\n[7] Updating profile with explicit target career CR001, GPA 8.2, 10 study hours...")
    upd_res = requests.put(f"{BASE_URL}/student/profile", headers=headers, json={
        "degree": "B.S. Computer Science",
        "institution": "National Institute of Technology",
        "institution_tier": 1,
        "graduation_year": 2026,
        "gpa": 8.2,
        "target_career_id": "CR001",
        "weekly_study_hours": 10.0
    }, timeout=15)
    assert upd_res.status_code == 200, f"Update profile failed: {upd_res.text}"
    upd_data = upd_res.json()
    assert upd_data.get("target_career_id") == "CR001"
    assert upd_data.get("gpa") == 8.2
    assert upd_data.get("weekly_study_hours") == 10.0
    print("    Profile updated successfully.")

    # 8. Add skills and projects
    print("\n[8] Adding skills (SK001: Python, SK002: React)...")
    s1_res = requests.post(f"{BASE_URL}/student/skills", headers=headers, json={
        "skill_id": "SK001",
        "proficiency_level": 3.5,
        "years_experience": 1.5
    }, timeout=15)
    assert s1_res.status_code == 201, f"Add skill 1 failed: {s1_res.text}"

    s2_res = requests.post(f"{BASE_URL}/student/skills", headers=headers, json={
        "skill_id": "SK002",
        "proficiency_level": 3.0,
        "years_experience": 1.0
    }, timeout=15)
    assert s2_res.status_code == 201, f"Add skill 2 failed: {s2_res.text}"

    print("    Adding project...")
    proj_res = requests.post(f"{BASE_URL}/student/projects", headers=headers, json={
        "title": "Cloud Scale Job Portal",
        "description": "Full-stack cloud portal with React frontend and FastAPI microservices.",
        "tech_stack": "React, Python, FastAPI, Docker",
        "complexity_rating": 4.0
    }, timeout=15)
    assert proj_res.status_code == 201, f"Add project failed: {proj_res.text}"

    # 9. Verify data persists after refresh
    print("\n[9] Verifying persistence on fresh GET...")
    verify_prof = requests.get(f"{BASE_URL}/student/profile", headers=headers, timeout=15).json()
    assert len(verify_prof.get("skills", [])) == 2
    assert verify_prof.get("projects_count") == 1
    assert verify_prof.get("target_career_id") == "CR001"
    print(f"    Verified: {len(verify_prof['skills'])} skills, {verify_prof['projects_count']} project persisted.")

    # 10. Logout and Login again to verify session and token persistence
    print("\n[10] Re-logging in with user credentials...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": fresh_email,
        "password": fresh_password
    }, timeout=15)
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    re_token = login_res.json()["access_token"]
    re_headers = {"Authorization": f"Bearer {re_token}"}
    re_prof = requests.get(f"{BASE_URL}/student/profile", headers=re_headers, timeout=15).json()
    assert len(re_prof.get("skills", [])) == 2
    assert re_prof.get("target_career_id") == "CR001"
    print("    Re-login successful and data persistence confirmed.")

    # 11. Verify readiness calculation now succeeds with student's actual data
    print("\n[11] Verifying ML readiness calculation with user's real profile...")
    ready_real = requests.post(f"{BASE_URL}/analysis/readiness", headers=re_headers, json={}, timeout=20)
    assert ready_real.status_code == 200, f"Readiness prediction failed: {ready_real.text}"
    ready_data = ready_real.json()
    print(f"    Readiness Score: {ready_data.get('readiness_score')}%")
    print(f"    Readiness Tier: {ready_data.get('readiness_tier')}")
    print(f"    Is Job Ready: {ready_data.get('is_job_ready')}")
    print(f"    Model Version: {ready_data.get('model_version')}")
    assert "readiness_score" in ready_data

    # 12. Verify multi-tenant isolation with a second fresh student
    print("\n[12] Verifying multi-tenant cross-account isolation...")
    s2_suffix = uuid.uuid4().hex[:8]
    s2_email = f"live_tenant2_{s2_suffix}@skill2career-test.com"
    s2_res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": s2_email,
        "password": "SecurePassword123!",
        "full_name": f"Tenant 2 {s2_suffix}",
        "role": "student"
    }, timeout=15)
    assert s2_res.status_code == 201
    s2_headers = {"Authorization": f"Bearer {s2_res.json()['access_token']}"}
    s2_prof = requests.get(f"{BASE_URL}/student/profile", headers=s2_headers, timeout=15).json()
    assert len(s2_prof.get("skills", [])) == 0
    assert s2_prof.get("projects_count") == 0
    assert s2_prof.get("target_career_id") is None
    print("    Second tenant isolated with clean empty state.")

    # 13. Verify Alex Chen demo account still works
    print("\n[13] Verifying Alex Chen demo account...")
    demo_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    }, timeout=15)
    assert demo_login.status_code == 200, f"Demo login failed: {demo_login.text}"
    demo_headers = {"Authorization": f"Bearer {demo_login.json()['access_token']}"}
    demo_prof = requests.get(f"{BASE_URL}/student/profile", headers=demo_headers, timeout=15).json()
    print(f"    Demo Name: {demo_prof.get('full_name')}")
    print(f"    Demo Target Career: {demo_prof.get('target_career_id')}")
    print(f"    Demo Skills Count: {len(demo_prof.get('skills', []))}")
    assert demo_prof.get("full_name") == "Alex Chen"
    assert demo_prof.get("target_career_id") == "CR004"
    assert len(demo_prof.get("skills", [])) > 0
    print("    Alex Chen demo account intact and verified.")

    print("\n" + "=" * 60)
    print("ALL 13 LIVE PRODUCTION VERIFICATIONS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_production_e2e_audit()
