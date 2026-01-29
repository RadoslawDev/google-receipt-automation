const API_KEY = 'HERE_API_KEY'; 
const FOLDER_ID = 'HERE_FOLDER_ID';
const ARCHIVE_FOLDER_ID = 'HERE_ARCHIVE_FOLDER_ID';

function processReceipts() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const archiveFolder = DriveApp.getFolderById(ARCHIVE_FOLDER_ID);
  const files = folder.getFiles();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const modelNameDisplay = "Gemini Flash Latest";
  console.log(`Rozpoczynam analizę szczegółową (Model: ${modelNameDisplay})...`);

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    
    if (mimeType.includes('image') || mimeType.includes('pdf')) {
      console.log("Przetwarzam: " + file.getName());
      
      try {
        const blob = file.getBlob();
        const base64Data = Utilities.base64Encode(blob.getBytes());
        
        // Prosimy o tablicę produktów
        const prompt = `Przeanalizuj ten paragon pozycja po pozycji.
        Dla każdego produktu na liście określ:
        1. Pełną nazwę produktu.
        2. Cenę końcową (jako liczba).
        3. Kategorię (wybierz z listy: Spożywcze, Warzywa/Owoce, Nabiał, Mięso, Napoje, Alkohol, Chemia, Dom, Inne).
        
        Wyciągnij też datę zakupu i nazwę sklepu.
        
        Zwróć TYLKO JSON w takim formacie:
        {
          "data": "YYYY-MM-DD",
          "sklep": "Nazwa Sklepu",
          "produkty": [
            {"nazwa": "Mleko 2%", "cena": 3.50, "kategoria": "Nabiał"},
            {"nazwa": "Chleb", "cena": 4.20, "kategoria": "Spożywcze"}
          ]
        }`;

        const responseText = callGeminiVision(base64Data, mimeType, prompt);
        
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);

        // PĘTLA: Dodajemy każdy produkt jako osobny wiersz
        if (data.produkty && data.produkty.length > 0) {
          data.produkty.forEach(produkt => {
            sheet.appendRow([
              data.data,          // A: Data (wspólna dla całego paragonu)
              data.sklep,         // B: Sklep (wspólny)
              produkt.nazwa,      // C: Konkretny produkt
              produkt.kategoria,  // D: Kategoria produktu
              produkt.cena,       // E: Cena produktu
              file.getUrl()       // F: Link do dowodu zakupu
            ]);
          });
          console.log(`Sukces! Dodano ${data.produkty.length} produktów ze sklepu ${data.sklep}`);
          file.moveTo(archiveFolder);
        } else {
          console.log("Nie udało się znaleźć listy produktów w JSON.");
        }
        
      } catch (e) {
        console.error("Błąd: " + e.toString());
      }
    }
  }
}

function callGeminiVision(base64Data, mimeType, prompt) {
  
  const modelVersion = "gemini-flash-latest"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${API_KEY}`;
  
  const payload = {
    "contents": [{
      "parts": [
        { "text": prompt },
        { "inline_data": { "mime_type": mimeType, "data": base64Data } }
      ]
    }]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  
  if (response.getResponseCode() !== 200) {
    throw new Error(`Błąd API (${response.getResponseCode()}): ${responseText}`);
  }

  const result = JSON.parse(responseText);
  return result.candidates[0].content.parts[0].text;
}
