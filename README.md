AI Receipt Scanner (Google Workspace Edition)

What does it do?

This project is a "Set and Forget" automation solution.
1. You take a photo of the receipt and upload it to a folder on Google Drive.
2. The script detects the file and sends it for analysis via Gemini 1.5 Flash.
3. The AI ​​reads not only the total, but also each item on the receipt (product, price, category).
4. The data is transferred to a table in Google Sheets.
5. The processed image is automatically archived.

Key Features

Intelligent OCR: Recognizes text even on crumpled receipts using Gemini Vision.
Product Extraction (Item-Level): Breaks down the receipt into individual rows (e.g., Milk, Bread).
Automatic Categorization: The AI ​​automatically assigns categories (e.g., Grocery, Chemicals, Home) based on the product name. File organization: Automatically move processed files to the Archive folder.

Technologies

Google Apps Script (Backend and logic)
Google Gemini API (Vision model)
Google Drive API (File handling)
Google Sheets (Database)

How to run (Installation)

The project runs in the Google cloud; you don't need to install anything on your computer.

1. Prepare a Google Sheet
Create a new sheet
In the first row, add the following headings: `Date`, `Shop`, `Product`, `Category`, `Price`, `Link`.
2. Prepare Google Drive:
Create a folder for new photos (e.g., `Paragony_IN`).
Create a folder for processed photos (e.g., `Paragony_ARCHIVE`).
3. Paste the Script:
In the Sheet, go to `Extensions` > `Apps Script`.
Paste the code from the `Code.js` file.
4. Configuration:

In the code, complete your data:

const API_KEY = 'YOUR_GEMINI_KEY';

const FOLDER_ID = 'FOLDER_ID_IN';

const ARCHIVE_FOLDER_ID = 'FOLDER_ID_ARCHIVE';

5. Run:

Run the `processReceipts` function. You can also set a timer to have the script check the folder every 15 minutes.

--

Author: RadoslawDev
