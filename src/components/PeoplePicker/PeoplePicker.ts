// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE in the project root for license information.

/// <reference path="../Overlay/Overlay.ts"/>
/// <reference path="../ContextualHost/ContextualHost.ts"/>

namespace fabric {
  /**
   * People Picker
   *
   * People picker control
   *
   */
  const MODAL_POSITION = "bottom";
  // const TOKEN_CLASS = "ms-Persona--token";

  export class PeoplePicker {

    private _container: Element;
    private _contextualHostView: ContextualHost;
    private _peoplePickerMenu: Element;
    private _peoplePickerSearch: Element;
    private _peoplePickerSearchBox: Element;
    private _peoplePickerResults: NodeListOf<Element>;

    /**
     *
     * @param {HTMLElement} container - the target container for an instance of People Picker
     * @constructor
     */
    constructor(container: Element) {
      this._container = container;
      this._peoplePickerMenu = this._container.querySelector(".ms-PeoplePicker-results");
      this._peoplePickerSearch = this._container.querySelector(".ms-TextField-field");
      this._peoplePickerSearchBox = this._container.querySelector(".ms-PeoplePicker-searchBox");
      this._assignClicks();

      if (this._peoplePickerMenu) {
        this._peoplePickerMenu.setAttribute("style", "display: none;");
      }
    }

    private _createModalHost(e) {
      e.stopPropagation();

      this._peoplePickerMenu.setAttribute("style", "display: block;");
      this._contextualHostView = new fabric.ContextualHost(
        <HTMLElement>this._peoplePickerMenu,
        MODAL_POSITION,
        this._peoplePickerSearchBox,
        true
      );
    }

    private _clickHandler(e) {
      this._createModalHost(e);

      // Select all results and remove event listeners by cloning
      let peoplePickerResults = this._peoplePickerMenu.querySelector(".ms-PeoplePicker-result");
      let resultsParent = peoplePickerResults.parentNode;
      let resultsClone = resultsParent.cloneNode(true);
      resultsParent.parentNode.replaceChild(resultsClone, resultsParent);

      // Get all results
      this._peoplePickerResults = this._peoplePickerMenu.querySelectorAll(".ms-PeoplePicker-result");

      // Add _selectResult listeners to each result
      for (let i = 0; i < this._peoplePickerResults.length; i++) {
        this._peoplePickerResults[i].addEventListener("click", this._selectResult.bind(this), true);
      }
    }

    private _selectResult(e) {
      e.stopPropagation();

      let currentResult = this._findPersona(e.target);
      let clonedResult: Element = <Element>currentResult.cloneNode(true);
      let openHost = document.querySelector(".ms-ContextualHost.is-open");

      // if facePile - add to members list / else tokenize
      if (this._container.classList.contains("ms-PeoplePicker--facePile")) {
        this._addResultToMembers(clonedResult);
      } else {
        this._tokenizeResult(clonedResult);
      }

      // Close the open contextual host
      openHost.classList.remove("is-open");
    }

    private _findPersona(childObj: Element) {
      let currentElement: Element = <Element>childObj.parentNode;

      while (!currentElement.classList.contains("ms-Persona")) {
          currentElement = <Element>currentElement.parentNode;
      }
      return currentElement;
    }

    private _addRemoveBtn(persona: Element, token?: Boolean) {
      let actionBtn;
      let actionIcon = document.createElement("i");

      if (token) {
        actionBtn = document.createElement("div");
        actionBtn.classList.add("ms-Persona-actionIcon");
      } else {
        actionBtn = document.createElement("button");
        actionBtn.classList.add("ms-PeoplePicker-resultAction");
      }

      actionIcon.classList.add("ms-Icon", "ms-Icon--x");

      actionBtn.appendChild(actionIcon);

      return persona.appendChild(actionBtn);
    }

    private _removeToken(e) {
      let currentToken = this._findPersona(e.target);
      currentToken.remove();
    }

    private _tokenizeResult(tokenResult: Element) {
      let searchBox = this._container.querySelector(".ms-PeoplePicker-searchBox");
      let textField = searchBox.querySelector(".ms-TextField");

      // Add token classes to persona
      tokenResult.classList.add("ms-Persona--token", "ms-PeoplePicker-persona");

      // Add the remove button to the token
      this._addRemoveBtn(tokenResult, true);

      // Use persona xs variant for token
      if (tokenResult.classList.contains("ms-Persona--sm")) {
        tokenResult.classList.remove("ms-Persona--sm");
        tokenResult.classList.add("ms-Persona--xs");
      }

      // Add removeToken event to actionIcon
      tokenResult.querySelector(".ms-Persona-actionIcon").addEventListener("click", this._removeToken.bind(this), true);

      // Prepend the token before the search field
      searchBox.insertBefore(tokenResult, textField);
    }

    private _addResultToMembers(persona: Element) {
      let membersList = this._container.querySelector(".ms-PeoplePicker-selectedPeople");
      let firstMember = membersList.querySelector(".ms-PeoplePicker-selectedPerson");
      let selectedItem = document.createElement("li");

      // Create the selectedPerson list item
      selectedItem.classList.add("ms-PeoplePicker-selectedPerson");
      selectedItem.tabIndex = 1;

      // Append the result persona to list item
      selectedItem.appendChild(persona);

      // Add the remove button to the persona
      this._addRemoveBtn(selectedItem, false);

      // Add removeToken event to resultAction
      selectedItem.querySelector(".ms-PeoplePicker-resultAction").addEventListener("click", this._removeToken.bind(this), true);

      membersList.insertBefore(selectedItem, firstMember);
    }

    private _assignClicks() {
      this._peoplePickerSearch.addEventListener("click", this._clickHandler.bind(this), true);
      this._peoplePickerSearch.addEventListener("focus", this._clickHandler.bind(this), true);
      this._peoplePickerSearch.addEventListener("keyup", this._clickHandler.bind(this), true);
    }
  }
}