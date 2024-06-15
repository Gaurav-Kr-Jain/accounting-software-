const list = document.querySelector('table');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const CrAmtInput = document.querySelector('#CrAmt');
const DrAccInput = document.querySelector('#DrAcc');
const DrAmtInput = document.querySelector('#DrAmt');



const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');

let db;

const openRequest = window.indexedDB.open("accounts_db", 1);
openRequest.addEventListener("error", () =>
  console.error("Database failed to open"),);
openRequest.addEventListener("success", () => {
  console.log("Database opened successfully");
  db = openRequest.result;
  displayData();

});

openRequest.addEventListener("upgradeneeded", (e) => {
  db = e.target.result;

  const objectStore = db.createObjectStore("notes_os", {
    keyPath: "id",
    autoIncrement: true,
  });

  objectStore.createIndex("title", "title", { unique: false });
  objectStore.createIndex("body", "body", { unique: false });
  objectStore.createIndex("CrAmt", "CrAmt", { unique: false });
  objectStore.createIndex("DrAcc", "DrAcc", { unique: false });
  objectStore.createIndex("DrAmt", "DrAmt", { unique: false });

});


form.addEventListener("submit", addData);

function addData(e) {
  e.preventDefault();

  const newItem = {
     title: titleInput.value, 
    body: bodyInput.value , 
    CrAmt: CrAmtInput.value,
    DrAcc:DrAccInput.value,
    DrAmt:DrAmtInput.value
  };

  const transaction = db.transaction(["notes_os"], "readwrite");

  const objectStore = transaction.objectStore("notes_os");

  const addRequest = objectStore.add(newItem);

  addRequest.addEventListener("success", () => {
    titleInput.value = "";
    bodyInput.value = "";
    CrAmtInput.value="";
    DrAccInput.value="";
    DrAmtInput.value="";

  });

  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");

    displayData();

  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error"),
  );
}
function displayData() {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  list.innerHTML= `<tr class="firstRow">
            <td>DATE</td>
            <td>Credit A/c</td>
            <td>Credit Amt</td>
            <td>Debit A/c</td>
            <td>Debit</td>
          </tr>`

  const objectStore = db.transaction("notes_os").objectStore("notes_os");
  objectStore.openCursor().addEventListener("success", (e) => {
    const cursor = e.target.result;

    if (cursor) {
      const listItem = document.createElement("tr");
      const h3 = document.createElement("td");
      const para = document.createElement("td");
      const CrAmount = document.createElement("td");
      const DrAccount = document.createElement("td");
      const DrAmount = document.createElement("td");
      
      listItem.appendChild(h3);
      listItem.appendChild(para);
      listItem.appendChild(CrAmount);
      listItem.appendChild(DrAccount);
      listItem.appendChild(DrAmount);

      list.appendChild(listItem);

      h3.textContent = cursor.value.title;
      para.textContent = cursor.value.body;
      CrAmount.textContent=cursor.value.CrAmt;
      DrAccount.textContent=cursor.value.DrAcc;
      DrAmount.textContent=cursor.value.DrAmt;


      listItem.setAttribute("data-note-id", cursor.value.id);

      const deleteBtn = document.createElement("button");
      listItem.appendChild(deleteBtn);
      deleteBtn.textContent = "Delete";

      deleteBtn.addEventListener("click", deleteItem);

      cursor.continue();
    } else {
      if (!list.firstChild) {
        const listItem = document.createElement("li");
        listItem.textContent = "No notes stored.";
        list.appendChild(listItem);
      }
      console.log("Notes all displayed");
      console.log(list.innerHTML);

    }
  });
}
function deleteItem(e) {
  const noteId = Number(e.target.parentNode.getAttribute("data-note-id"));

  const transaction = db.transaction(["notes_os"], "readwrite");
  const objectStore = transaction.objectStore("notes_os");
  const deleteRequest = objectStore.delete(noteId);

  transaction.addEventListener("complete", () => {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    console.log(`Note ${noteId} deleted.`);

    if (!list.firstChild) {
      const listItem = document.createElement("li");
      listItem.textContent = "No notes stored.";
      list.appendChild(listItem);
    }
  });
}
