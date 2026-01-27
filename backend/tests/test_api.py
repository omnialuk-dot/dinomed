"""
Backend API Tests for DinoMed Platform
Tests: Dispense CRUD, Simulazioni CRUD, Domande CRUD, File Upload
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API Root: {data}")


class TestDispenseCRUD:
    """Dispense CRUD operations"""
    
    def test_get_dispense_list(self):
        """Test GET /api/dispense/"""
        response = requests.get(f"{BASE_URL}/api/dispense/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Dispense count: {len(data)}")
    
    def test_create_dispensa(self):
        """Test POST /api/dispense/ - Create new dispensa"""
        payload = {
            "titolo": f"TEST_Dispensa_{uuid.uuid4().hex[:8]}",
            "materia": "Biologia",
            "descrizione": "Test dispensa description",
            "aChiServe": "Studenti di medicina",
            "pagine": 50,
            "tag": ["test", "biologia"],
            "filename": None
        }
        response = requests.post(f"{BASE_URL}/api/dispense/", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["titolo"] == payload["titolo"]
        assert data["materia"] == payload["materia"]
        assert data["pubblicata"] == True  # Default is published
        print(f"Created dispensa: {data['id']}")
        return data["id"]
    
    def test_create_and_verify_dispensa_persistence(self):
        """Test dispensa is persisted in database"""
        # Create
        payload = {
            "titolo": f"TEST_Persistence_{uuid.uuid4().hex[:8]}",
            "materia": "Chimica",
            "descrizione": "Persistence test",
            "aChiServe": "Test users",
            "pagine": 25,
            "tag": ["persistence"],
            "filename": None
        }
        create_response = requests.post(f"{BASE_URL}/api/dispense/", json=payload)
        assert create_response.status_code == 200
        created = create_response.json()
        dispensa_id = created["id"]
        
        # Verify by fetching all and checking
        get_response = requests.get(f"{BASE_URL}/api/dispense/")
        assert get_response.status_code == 200
        dispense_list = get_response.json()
        found = next((d for d in dispense_list if d["id"] == dispensa_id), None)
        assert found is not None, "Created dispensa not found in list"
        assert found["titolo"] == payload["titolo"]
        print(f"Verified dispensa persistence: {dispensa_id}")
    
    def test_toggle_dispensa_status(self):
        """Test PATCH /api/dispense/{id}/toggle"""
        # First create a dispensa
        payload = {
            "titolo": f"TEST_Toggle_{uuid.uuid4().hex[:8]}",
            "materia": "Fisica",
            "descrizione": "Toggle test",
            "aChiServe": "Test",
            "pagine": 10,
            "tag": ["toggle"],
            "filename": None
        }
        create_response = requests.post(f"{BASE_URL}/api/dispense/", json=payload)
        assert create_response.status_code == 200
        dispensa_id = create_response.json()["id"]
        initial_status = create_response.json()["pubblicata"]
        
        # Toggle status
        toggle_response = requests.patch(f"{BASE_URL}/api/dispense/{dispensa_id}/toggle")
        assert toggle_response.status_code == 200
        toggle_data = toggle_response.json()
        assert toggle_data["success"] == True
        assert toggle_data["pubblicata"] != initial_status
        print(f"Toggled dispensa {dispensa_id}: {initial_status} -> {toggle_data['pubblicata']}")
    
    def test_delete_dispensa(self):
        """Test DELETE /api/dispense/{id}"""
        # Create first
        payload = {
            "titolo": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "materia": "Generale",
            "descrizione": "Delete test",
            "aChiServe": "Test",
            "pagine": 5,
            "tag": ["delete"],
            "filename": None
        }
        create_response = requests.post(f"{BASE_URL}/api/dispense/", json=payload)
        assert create_response.status_code == 200
        dispensa_id = create_response.json()["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/dispense/{dispensa_id}")
        assert delete_response.status_code == 200
        delete_data = delete_response.json()
        assert delete_data["success"] == True
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/dispense/")
        dispense_list = get_response.json()
        found = next((d for d in dispense_list if d["id"] == dispensa_id), None)
        assert found is None, "Deleted dispensa still exists"
        print(f"Deleted dispensa: {dispensa_id}")
    
    def test_get_dispense_pubbliche(self):
        """Test GET /api/dispense/pubbliche - only published"""
        response = requests.get(f"{BASE_URL}/api/dispense/pubbliche")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All should be published
        for d in data:
            assert d["pubblicata"] == True
        print(f"Public dispense count: {len(data)}")


class TestSimulazioniCRUD:
    """Simulazioni CRUD operations"""
    
    def test_get_simulazioni_list(self):
        """Test GET /api/simulazioni/"""
        response = requests.get(f"{BASE_URL}/api/simulazioni/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Simulazioni count: {len(data)}")
    
    def test_create_simulazione(self):
        """Test POST /api/simulazioni/ - Create new simulazione"""
        payload = {
            "titolo": f"TEST_Simulazione_{uuid.uuid4().hex[:8]}",
            "materia": "Biologia",
            "tipo": "crocette",
            "domande": 10,
            "durata": "15 min",
            "livello": "medio",
            "descrizione": "Test simulazione description"
        }
        response = requests.post(f"{BASE_URL}/api/simulazioni/", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["titolo"] == payload["titolo"]
        assert data["attiva"] == False  # Default is not active
        print(f"Created simulazione: {data['id']}")
        return data["id"]
    
    def test_create_and_verify_simulazione_persistence(self):
        """Test simulazione is persisted in database"""
        payload = {
            "titolo": f"TEST_SimPersist_{uuid.uuid4().hex[:8]}",
            "materia": "Chimica",
            "tipo": "completamento",
            "domande": 5,
            "durata": "10 min",
            "livello": "facile",
            "descrizione": "Persistence test"
        }
        create_response = requests.post(f"{BASE_URL}/api/simulazioni/", json=payload)
        assert create_response.status_code == 200
        sim_id = create_response.json()["id"]
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/simulazioni/")
        sim_list = get_response.json()
        found = next((s for s in sim_list if s["id"] == sim_id), None)
        assert found is not None
        assert found["titolo"] == payload["titolo"]
        print(f"Verified simulazione persistence: {sim_id}")
    
    def test_toggle_simulazione_status(self):
        """Test PATCH /api/simulazioni/{id}/toggle"""
        # Create
        payload = {
            "titolo": f"TEST_SimToggle_{uuid.uuid4().hex[:8]}",
            "materia": "Fisica",
            "tipo": "mix",
            "domande": 8,
            "durata": "12 min",
            "livello": "difficile",
            "descrizione": "Toggle test"
        }
        create_response = requests.post(f"{BASE_URL}/api/simulazioni/", json=payload)
        assert create_response.status_code == 200
        sim_id = create_response.json()["id"]
        initial_status = create_response.json()["attiva"]
        
        # Toggle
        toggle_response = requests.patch(f"{BASE_URL}/api/simulazioni/{sim_id}/toggle")
        assert toggle_response.status_code == 200
        toggle_data = toggle_response.json()
        assert toggle_data["success"] == True
        assert toggle_data["attiva"] != initial_status
        print(f"Toggled simulazione {sim_id}: {initial_status} -> {toggle_data['attiva']}")
    
    def test_delete_simulazione(self):
        """Test DELETE /api/simulazioni/{id}"""
        # Create
        payload = {
            "titolo": f"TEST_SimDelete_{uuid.uuid4().hex[:8]}",
            "materia": "Biologia",
            "tipo": "crocette",
            "domande": 3,
            "durata": "5 min",
            "livello": "facile",
            "descrizione": "Delete test"
        }
        create_response = requests.post(f"{BASE_URL}/api/simulazioni/", json=payload)
        assert create_response.status_code == 200
        sim_id = create_response.json()["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/simulazioni/{sim_id}")
        assert delete_response.status_code == 200
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/simulazioni/")
        sim_list = get_response.json()
        found = next((s for s in sim_list if s["id"] == sim_id), None)
        assert found is None
        print(f"Deleted simulazione: {sim_id}")
    
    def test_get_simulazione_completa(self):
        """Test GET /api/simulazioni/{id} - get simulazione with domande"""
        # Create simulazione
        payload = {
            "titolo": f"TEST_SimCompleta_{uuid.uuid4().hex[:8]}",
            "materia": "Biologia",
            "tipo": "crocette",
            "domande": 5,
            "durata": "10 min",
            "livello": "medio",
            "descrizione": "Complete test"
        }
        create_response = requests.post(f"{BASE_URL}/api/simulazioni/", json=payload)
        assert create_response.status_code == 200
        sim_id = create_response.json()["id"]
        
        # Get complete
        get_response = requests.get(f"{BASE_URL}/api/simulazioni/{sim_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert "simulazione" in data
        assert "domande_list" in data
        assert data["simulazione"]["id"] == sim_id
        print(f"Got complete simulazione: {sim_id}")


class TestDomandeCRUD:
    """Domande CRUD operations within simulazioni"""
    
    @pytest.fixture
    def simulazione_id(self):
        """Create a simulazione for testing domande"""
        payload = {
            "titolo": f"TEST_DomandeParent_{uuid.uuid4().hex[:8]}",
            "materia": "Biologia",
            "tipo": "crocette",
            "domande": 10,
            "durata": "15 min",
            "livello": "medio",
            "descrizione": "Parent for domande tests"
        }
        response = requests.post(f"{BASE_URL}/api/simulazioni/", json=payload)
        return response.json()["id"]
    
    def test_add_domanda_crocetta(self, simulazione_id):
        """Test POST /api/simulazioni/{id}/domande - crocetta type"""
        payload = {
            "testo": "Qual è la funzione principale del mitocondrio?",
            "tipo": "crocetta",
            "opzioni": ["Fotosintesi", "Respirazione cellulare", "Sintesi proteica", "Divisione cellulare"],
            "rispostaCorretta": "1",
            "risposteAccettate": None,
            "spiegazione": "Il mitocondrio è la centrale energetica della cellula",
            "materia": "Biologia"
        }
        response = requests.post(f"{BASE_URL}/api/simulazioni/{simulazione_id}/domande", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["testo"] == payload["testo"]
        assert data["tipo"] == "crocetta"
        assert len(data["opzioni"]) == 4
        print(f"Added crocetta domanda: {data['id']}")
    
    def test_add_domanda_completamento(self, simulazione_id):
        """Test POST /api/simulazioni/{id}/domande - completamento type"""
        payload = {
            "testo": "Il DNA è composto da _____ nucleotidi",
            "tipo": "completamento",
            "opzioni": None,
            "rispostaCorretta": "quattro",
            "risposteAccettate": ["quattro", "4", "four"],
            "spiegazione": "I nucleotidi sono A, T, G, C",
            "materia": "Biologia"
        }
        response = requests.post(f"{BASE_URL}/api/simulazioni/{simulazione_id}/domande", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["tipo"] == "completamento"
        print(f"Added completamento domanda: {data['id']}")
    
    def test_get_domande_list(self, simulazione_id):
        """Test GET /api/simulazioni/{id}/domande"""
        # Add a domanda first
        payload = {
            "testo": "Test domanda for list",
            "tipo": "crocetta",
            "opzioni": ["A", "B", "C", "D"],
            "rispostaCorretta": "0",
            "spiegazione": "Test",
            "materia": "Biologia"
        }
        requests.post(f"{BASE_URL}/api/simulazioni/{simulazione_id}/domande", json=payload)
        
        # Get list
        response = requests.get(f"{BASE_URL}/api/simulazioni/{simulazione_id}/domande")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"Domande count for simulazione {simulazione_id}: {len(data)}")
    
    def test_delete_domanda(self, simulazione_id):
        """Test DELETE /api/simulazioni/{sim_id}/domande/{domanda_id}"""
        # Create domanda
        payload = {
            "testo": "Domanda to delete",
            "tipo": "crocetta",
            "opzioni": ["A", "B"],
            "rispostaCorretta": "0",
            "spiegazione": "Delete test",
            "materia": "Biologia"
        }
        create_response = requests.post(f"{BASE_URL}/api/simulazioni/{simulazione_id}/domande", json=payload)
        domanda_id = create_response.json()["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/simulazioni/{simulazione_id}/domande/{domanda_id}")
        assert delete_response.status_code == 200
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/simulazioni/{simulazione_id}/domande")
        domande_list = get_response.json()
        found = next((d for d in domande_list if d["id"] == domanda_id), None)
        assert found is None
        print(f"Deleted domanda: {domanda_id}")


class TestFileUpload:
    """File upload operations"""
    
    def test_list_files(self):
        """Test GET /api/files/list"""
        response = requests.get(f"{BASE_URL}/api/files/list")
        assert response.status_code == 200
        data = response.json()
        assert "files" in data
        assert isinstance(data["files"], list)
        print(f"Files count: {len(data['files'])}")
    
    def test_upload_pdf(self):
        """Test POST /api/files/upload - PDF"""
        # Create a simple test PDF content
        test_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF"
        files = {"file": ("test_document.pdf", test_content, "application/pdf")}
        data = {"file_type": "pdf"}
        
        response = requests.post(f"{BASE_URL}/api/files/upload", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert result["success"] == True
        assert "filename" in result
        assert result["file_type"] == "pdf"
        print(f"Uploaded PDF: {result['filename']}")
        return result["filename"]
    
    def test_upload_image(self):
        """Test POST /api/files/upload - Image"""
        # Create a minimal PNG (1x1 pixel)
        png_content = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,  # IEND chunk
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        files = {"file": ("test_image.png", png_content, "image/png")}
        data = {"file_type": "image"}
        
        response = requests.post(f"{BASE_URL}/api/files/upload", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert result["success"] == True
        assert result["file_type"] == "image"
        print(f"Uploaded image: {result['filename']}")
        return result["filename"]
    
    def test_delete_file(self):
        """Test DELETE /api/files/{filename}"""
        # Upload first
        test_content = b"%PDF-1.4\ntest"
        files = {"file": ("delete_test.pdf", test_content, "application/pdf")}
        data = {"file_type": "pdf"}
        upload_response = requests.post(f"{BASE_URL}/api/files/upload", files=files, data=data)
        filename = upload_response.json()["filename"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/files/{filename}?file_type=pdf")
        assert delete_response.status_code == 200
        result = delete_response.json()
        assert result["success"] == True
        print(f"Deleted file: {filename}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_dispense(self):
        """Remove TEST_ prefixed dispense"""
        response = requests.get(f"{BASE_URL}/api/dispense/")
        dispense = response.json()
        deleted = 0
        for d in dispense:
            if d["titolo"].startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/dispense/{d['id']}")
                deleted += 1
        print(f"Cleaned up {deleted} test dispense")
    
    def test_cleanup_test_simulazioni(self):
        """Remove TEST_ prefixed simulazioni"""
        response = requests.get(f"{BASE_URL}/api/simulazioni/")
        simulazioni = response.json()
        deleted = 0
        for s in simulazioni:
            if s["titolo"].startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/simulazioni/{s['id']}")
                deleted += 1
        print(f"Cleaned up {deleted} test simulazioni")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
