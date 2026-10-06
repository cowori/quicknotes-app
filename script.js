const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");
const noteCount = document.querySelector("#note-count");
const notesList = document.querySelector("#notes-list");
const clearAllButton = document.querySelector("#clear-all-btn");

const STORAGE_KEY = "quicknotes-notes";

let notes = loadNotes();

function loadNotes() {
    const savedNotes = localStorage.getItem(STORAGE_KEY);

    if (savedNotes === null) {
        return [];
    }

    try {
        const parsedNotes = JSON.parse(savedNotes);

        if (Array.isArray(parsedNotes)) {
            return parsedNotes;
        }

        return [];
    } catch (error) {
        console.error("The saved notes could not be loaded.", error);
        return [];
    }
}

function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function updateNoteCount() {
    if (notes.length === 0) {
        noteCount.textContent = "You have no notes yet.";
    } else if (notes.length === 1) {
        noteCount.textContent = "You have 1 note.";
    } else {
        noteCount.textContent = `You have ${notes.length} notes.`;
    }
}

function getSearchWords() {
    return searchInput.value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word !== "");
}

function getFilteredNotes() {
    const searchWords = getSearchWords();

    if (searchWords.length === 0) {
        return notes;
    }

    return notes.filter((note) => {
        const noteText = note.text.toLowerCase();

        return searchWords.every((word) => noteText.includes(word));
    });
}

function createNoteCard(note) {
    const listItem = document.createElement("li");
    listItem.classList.add("note-card");
    listItem.classList.add(`category-${note.category}`);

    const textParagraph = document.createElement("p");
    textParagraph.classList.add("note-text");
    textParagraph.textContent = note.text;

    const details = document.createElement("div");
    details.classList.add("note-details");

    const categoryLabel = document.createElement("span");
    categoryLabel.classList.add("category-label");
    categoryLabel.textContent =
        note.category.charAt(0).toUpperCase() + note.category.slice(1);

    const date = document.createElement("time");
    date.classList.add("note-date");
    date.textContent = note.createdAt;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete note: ${note.text}`);

    deleteButton.addEventListener("click", () => {
        deleteNote(note.id);
    });

    details.append(categoryLabel, date, deleteButton);
    listItem.append(textParagraph, details);

    return listItem;
}

function render() {
    notesList.replaceChildren();
    updateNoteCount();

    const filteredNotes = getFilteredNotes();
    const searchIsActive = searchInput.value.trim() !== "";

    if (filteredNotes.length === 0 && searchIsActive) {
        const message = document.createElement("li");
        message.classList.add("empty-message");
        message.textContent = "No notes match your search.";
        notesList.append(message);
        return;
    }

    if (filteredNotes.length === 0) {
        const message = document.createElement("li");
        message.classList.add("empty-message");
        message.textContent = "Your notes will appear here.";
        notesList.append(message);
        return;
    }

    filteredNotes.forEach((note) => {
        const noteCard = createNoteCard(note);
        notesList.append(noteCard);
    });
}

function createNoteId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addNote(text, category) {
    const note = {
        id: createNoteId(),
        text: text,
        category: category,
        createdAt: new Date().toLocaleString(),
    };

    notes.push(note);
    saveNotes();
    render();
}

function deleteNote(noteId) {
    notes = notes.filter((note) => note.id !== noteId);
    saveNotes();
    render();
}

function validateNote(text) {
    if (text.trim() === "") {
        return "Please type a note first.";
    }

    if (text.length > 200) {
        return "Notes must be 200 characters or fewer.";
    }

    return "";
}
noteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = noteInput.value.trim();
    const category = noteCategory.value;
    const validationMessage = validateNote(noteInput.value);

    if (validationMessage !== "") {
        errorMessage.textContent = validationMessage;
        return;
    }

    errorMessage.textContent = "";
    addNote(text, category);

    noteForm.reset();
    noteInput.focus();
});

searchInput.addEventListener("input", () => {
    render();
});

clearAllButton.addEventListener("click", () => {
    if (notes.length === 0) {
        return;
    }

    const shouldDelete = confirm("Delete all notes?");

    if (shouldDelete) {
        notes = [];
        saveNotes();
        render();
    }
});

render();