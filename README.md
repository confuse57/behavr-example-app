# BEHAVR Web Demo — AI Customer Support

A small browser demo of an e-commerce support tool built on [`behavr-sdk`](https://www.npmjs.com/package/behavr-sdk).

- **Upload** a product photo for a customer → stored as a BEHAVR memory.
- **Ask** a question about that customer → answered only from their memories.

The Express backend (`server.js`) wraps the SDK so your API key stays on the
server and is never sent to the browser.

## Run it

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your API key to `.env` (copy `.env.example` if `.env` doesn't exist):

   ```
   BEHAVR_API_KEY=your_api_key_here
   PORT=3000
   ```

   `.env` is in `.gitignore`, so it won't be committed.

3. Start the server:

   ```bash
   npm start
   ```

4. Open **http://localhost:3000** in your browser.

## Using the demo

1. Enter a Customer ID (e.g. `customer_001`), choose an image, click **Upload**.
2. Wait ~15 seconds — BEHAVR processes the image in the background.
3. Type a question (e.g. *"What product did this customer upload?"*) and click **Ask**.

Try a different Customer ID with the same question to show that memories are
isolated per customer.

## API

| Method | Path            | Body                                                  | Returns                          |
| ------ | --------------- | ----------------------------------------------------- | -------------------------------- |
| POST   | `/api/remember` | multipart: `file`, `customerId` (or `?customerId=`)   | `{ memory_id, status, summary }` |
| POST   | `/api/ask`      | JSON: `{ customerId, question }`                      | `{ answer, sources }`            |
