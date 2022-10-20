import {VALUE, VALID, EDITABLE, LABEL} from "../presentationModel/presentationModel.js";

export {personListItemProjector, personFormProjector, personTableProjector}

const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALID, true).onChange(
        valid => valid
            ? inputElement.classList.remove("invalid")
            : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
            ? inputElement.removeAttribute("readonly")
            : inputElement.setAttribute("readonly", true));

    textAttr.getObs(LABEL, '').onChange(label => inputElement.setAttribute("title", label));
};

const personTextProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

const personListItemProjector = (masterController, selectionController, rootElement, person) => {

    const deleteButton = document.createElement("Button");
    deleteButton.setAttribute("class", "delete");
    deleteButton.innerHTML = "&times;";
    deleteButton.onclick = _ => masterController.removePerson(person);

    const firstnameInputElement = personTextProjector(person.firstname);
    const lastnameInputElement = personTextProjector(person.lastname);

    firstnameInputElement.onfocus = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onfocus = _ => selectionController.setSelectedPerson(person);

    selectionController.onPersonSelected(
        selected => selected === person
            ? deleteButton.classList.add("selected")
            : deleteButton.classList.remove("selected")
    );

    masterController.onPersonRemove((removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(deleteButton);
        rootElement.removeChild(firstnameInputElement);
        rootElement.removeChild(lastnameInputElement);
        selectionController.clearSelection();
        removeMe();
    });

    rootElement.appendChild(deleteButton);
    rootElement.appendChild(firstnameInputElement);
    rootElement.appendChild(lastnameInputElement);
    selectionController.setSelectedPerson(person);
};

const personTableProjector = (masterController, selectionController, rootElement) => {
    const personTable = document.createElement("table");
    personTable.classList.add("personMasterTable");
    personTable.innerHTML =
        "<tr>" +
            "<th>&nbsp;&nbsp;</th>" +
            "<th>Firstname</th>" +
            "<th>Lastname</th>" +
        "</tr>";
    const render = (person) => {
        personTableProjector(masterController, selectionController, personTable, person)
    }
    rootElement.appendChild(personTable);
    masterController.onPersonAdd(render);
};

const personFormProjector = (detailController, rootElement, person) => {

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="detail-form">
            <LABEL for="firstname"></LABEL>
            <INPUT TYPE="text" size="20" id="firstname">   
            <LABEL for="lastname"></LABEL>
            <INPUT TYPE="text" size="20" id="lastname">   
        </DIV>
    </FORM>`;

    bindTextInput(person.firstname, divElement.querySelector('#firstname'));
    bindTextInput(person.lastname, divElement.querySelector('#lastname'));

    // beware of memory leak in person.firstname observables
    person.firstname.getObs(LABEL, '')
        .onChange(label => divElement.querySelector('[for=firstname]').textContent = label);
    person.lastname.getObs(LABEL, '')
        .onChange(label => divElement.querySelector('[for=lastname]').textContent = label);

    rootElement.firstChild.replaceWith(divElement);
};
