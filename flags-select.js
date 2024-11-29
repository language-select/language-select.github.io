// ========================================================================== How to publish
// Build this file with Ctrl+Shift+P -> Task Build
// Git push flags.min.js

// <language-select-flags> Web Component loaded after user clicks the UI button (button.min.js)

// dependencies: flagmeister (loaded here as well)

// IIFE so multiple sources can be concatenated
!(function (
  // --------------------------------------------------------------------------- auto minify window.methods
  {
    // Array,
    // localStorage,
    // location,
    // fetch,
    // URLSearchParams,
    // navigator,
    // Promise,
    console,
    customElements,
    CustomEvent,
    document,
    HTMLElement,
    Object,
    setTimeout,
  } = window
) {
  // ========================================================================== String substitutions
  // -------------------------------------------- JavaScript substitutions for more unreadable code
  const [
    _APPEND_,
    _DEFINE_,
    _ATTACHSHADOW_,
    _SHADOWROOT_,
    _INNERHTML_,
    _GETATTRIBUTE_,
    _SETATTRIBUTE_,
    _QUERYSELECTOR_,
    _ADDEVENTLISTENER_,
    _REMOVEEVENTLISTENER_,
    _ONCLICK_,
    _ATTR_PART_,
  ] = (
    "append,define,attachShadow,shadowRoot,innerHTML,getAttribute,setAttribute,querySelector" +
    ",addEventListener,removeEventListener,onclick,part"
  ).split(",");
  // ============================================================================ Helper Functions
  /**
   * Creates a new HTML element with the specified tag and properties.
   *
   * @param {string} tag - The tag name of the element to create.
   * @param {Object} [props={}] - An object containing properties to set on the created element.
   * @param {Array} [props.append] - An array of child nodes to append to the created element.
   * @returns {HTMLElement} The created HTML element with the specified properties.
   */
  const createElement = (tag, props = {}) => {
    let el = document.createElement(tag);
    if (props.append) {
      el.append(...props.append);
      delete props.append;
    }
    return Object.assign(el, props);
  };
  // -------------------------------------------------------------------------- createSTYLEElement
  /**
   * Creates a new <style> element with the specified text content and properties.
   *
   * @param {string} textContent - The text content to set inside the <style> element.
   * @param {Object} [props={}] - An object containing properties to set on the created element.
   * @returns {HTMLElement} The created <style> HTML element with the specified properties.
   */
  const createSTYLEElement = (textContent, props = {}) =>
    createElement("style", { textContent, ...props });

  // ============================================================================ create <flag-xx> elements
  /**
   * Creates a new <flag-xx> element with the specified properties.
   *
   * @param {string} is - ISO code for this flag
   * @param {string} part - part name for users for style this element
   * @param {element} flag - created flag element or optional add existing one
   * @param {detail} detail - width pixels when to load detailed flag
   * @returns {HTMLElement} The created <style> HTML element with the specified properties.
   */
  const createFlagMeisterFlag = ({
    is,
    part = "flag-" + is,
    flag = createElement("flag-" + is),
    detail = 9999, // prevent loading of detailed flags
  }) => {
    flag.setAttribute("detail", detail); // prevent loading of detailed flags
    flag.setAttribute(_ATTR_PART_, part); // for shadowDOM styling
    return flag;
  };

  /** CONSTANTS */
  // ============================================================================ WC
  const _WCCALLBACK_CONNECTEDDONE_ = "connectedDoneCallback",
    _WCCALLBACK_RENDERED_ = "renderedCallback";
  // ============================================================================ Events
  // emitted to public application
  // component defined in button.js
  const _EVENT_LANGUAGE_SELECTED_ = "language-select"; // todo maybe extra from load URI
  // internal events
  const _EVENT_REMOVE_ = _EVENT_LANGUAGE_SELECTED_ + "remove";
  const _INTERNAL_EVENT_LANGUAGE_SELECT_BY_FLAG_ = "language-selected-by-flag";
  // ============================================================================ Attributes
  // public attribute
  // const_ATTR_PART_ = "part"; // FROM propertysting at top of file
  const _ATTR_SELECTED_ = "selected";
  const _ATTR_SELECTABLE_ = "selectable";
  const _DIALOG_ = "dialog";
  // ============================================================================ Web Components
  const part = (name) => `[part="${name}"]`;
  const _WC_FLAG_LANGUAGE_ = "flag-language";
  const _WC = {
    _LANGUAGE_SELECT_FLAGS_: {
      name: "language-select-flags",
      css:
        ":host{--selectcolor:lightgreen;--flagbackground:lightgrey}" +
        // <dialog>
        part(_DIALOG_) +
        `{user-select:none}` +
        part(_DIALOG_) +
        `{border:none;border-radius:6px;box-shadow:0 4px 4px rgba(0,0,0,.3)}` +
        // title inside dialog
        part("title") +
        `{text-align:center}` +
        // language-select flags SVG
        `svg{width:10%;cursor:pointer}`,
      animationcss:
        `dialog{opacity:0;transform:scale(.3);transition:opacity .3s ease, transform .3s ease}` +
        //* Style when dialog is visible set onanimationend in Web Component
        //`dialog[open]{opacity:1;transform:scale(1)}` +
        //* Backdrop effect for the dialog
        `dialog::backdrop{background:rgba(0,0,0,.3);` +
        `animation:fadeIn .3s ease}` +
        //* Keyframes for the backdrop fade-in effect
        `@keyframes fadeIn{to{opacity:1}}` +
        `@keyframes fadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0.3)}}` +
        "",
    },
    _LANGUAGE_SELECTORS_: {
      name: "language-selectors",
      css:
        ":host{display:flex;flex-wrap:wrap;gap:.7em;max-width:1180px;user-select:none}" +
        ":host>*{flex:1 1 7%}" + // 12.5% for 8 columns minus gap
        "",
      // CSS for EVERY flag to highlighted the selected flag
      selected: (hostlang, listlang = hostlang) =>
        `:host([selected*='${hostlang}']) ${_WC_FLAG_LANGUAGE_}[is='${listlang}']{order:1;background:var(--selectcolor)}`,
    },
    _LANGSELECTORS_FLAG_: {
      name: _WC_FLAG_LANGUAGE_,
      css:
        // flag image + language label
        `:host{display:inline-block;display:grid;padding:.5em;max-width:100px}` +
        // default disabled language, order:1 for selected language set below
        `:host{order:3;background:#eee;opacity:.3;pointer-events:none}` +
        // standard selectable languages
        `:host(.${_ATTR_SELECTABLE_}){order:2;opacity:1;cursor:pointer;pointer-events:auto;background:var(--flagbackground,lightgrey)}` +
        // selected language set in CSS selector maker for each flag below
        //`.selected{background:var(--selectcolor)}` +
        // flag
        //`[part="flag"]{transition:transform 0.2s;display:block;width:100%;aspect-ratio:4/3}` +
        "img{max-width:100%;aspect-ratio:4/3}" +
        part("label") + // center label below flag
        `{font-size:var(--select-language-font-size,16px);text-align:center}` +
        //`{width:100%;display:flex;align-items:center;justify-content:center;height:100%;white-space:no-wrap}` +

        // shadow needs work
        // part("flag") +
        // `{box-shadow:0 1px 1px rgba(0, 0, 0, 0.9)}` +
        "",
    },
  };

  // **************************************************************************** BaseClassElement
  // BaseClass for all Web Components
  // $listen
  // $emit
  // connectedCallback
  // disconnectedCallback

  const BaseClassElement = class extends HTMLElement {
    // ------------------------------------------------------------------------ BaseClass $listen
    /**
     * Adds an event listener to the specified scope and keeps track of it for later removal.
     *
     * @param {Object} params - The parameters for the event listener.
     * @param {string} params.type - The type of the event to listen for.
     * @param {Function} params.func - The function to call when the event is triggered.
     * @param {EventTarget} [params.scope=document] - The scope in which to add the event listener. Defaults to the document.
     * @param {Object} [params.options={}] - Additional options to pass to the event listener.
     * @returns {Function} A function that removes the event listener when called.
     */
    $listen({ type, func, scope = document, options = {} }) {
      scope.addEventListener(type, func, options);
      let remove = () => scope.removeEventListener(type, func, options);
      this.listeners = this.listeners || [];
      this.listeners.push(remove);
      return remove;
    }

    // ------------------------------------------------------------------------ BaseClass $emit
    /**
     * Dispatches a custom event with the specified parameters.
     *
     * @param {Object} params - The parameters for the custom event.
     * @param {string} [params.type="CustomEvent"] - The type of the custom event.
     * @param {Object} [params.detail={}] - The detail object to include with the event.
     * @param {boolean} [params.bubbles=true] - Whether the event bubbles up through the DOM or not.
     * @param {boolean} [params.composed=true] - Whether the event can bubble across the shadow DOM boundary.
     * @param {EventTarget} [params.scope=this] - The scope in which to dispatch the event. Defaults to the current instance.
     */
    $emit({
      type = "CustomEvent",
      detail = {},
      bubbles = true,
      composed = true,
      scope = this,
    }) {
      scope.dispatchEvent(new CustomEvent(type, { detail, bubbles, composed }));
    }
    // ------------------------------------------------------------------------ BaseClass connectedCallback
    connectedCallback() {
      if (this[_WCCALLBACK_CONNECTEDDONE_]) this[_WCCALLBACK_CONNECTEDDONE_]();
      // wait till innerHTML is parsed
      if (this[_WCCALLBACK_RENDERED_])
        setTimeout(() => this[_WCCALLBACK_RENDERED_](), 1);
    } // connectedCallback
    // ------------------------------------------------------------------------ BaseClass disconnectedCallback
    disconnectedCallback() {
      this.listeners?.forEach((remove) => remove());
    } // disconnectedCallback
  }; // BaseClassElement

  // ************************************************************************** <language-select>
  customElements.define(
    _WC._LANGUAGE_SELECT_FLAGS_.name,
    class LanguageSelector extends BaseClassElement {
      // ---------------------------------------------------------------------- connectedCallback
      [_WCCALLBACK_CONNECTEDDONE_]() {
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(_WC._LANGUAGE_SELECT_FLAGS_.css),
          createSTYLEElement(_WC._LANGUAGE_SELECT_FLAGS_.animationcss),
          (this.dialog = createElement(_DIALOG_, {
            part: _DIALOG_,
            append: [
              // createElement("form", {
              //   append: [
              createElement("h2", {
                part: "title",
                textContent:
                  this.getAttribute("caption") || "Select Your Language",
                onclick: () => this.dialog.close(),
              }),
              (this.ALLSELECTORS = createElement(
                _WC._LANGUAGE_SELECTORS_.name,
                {
                  lshost: this.lshost,
                }
              )),
            ],
            // }), // "form"
            // ], // form .append
            /* <dialog> */ onclick: (event) => {
              if (event.target === this.dialog) {
                this.dialog.close();
                this.$emit({
                  type: _EVENT_REMOVE_,
                });
              }
            },
          })) // <dialog>
        ); // append
        // -------------------------------------------------------------------- <dialog> animation
        let dialog = this.dialog;
        dialog.onanimationend = () => {
          dialog.style.opacity = "1";
          dialog.style.transform = "scale(1)";
        };

        // -------------------------------------------------------------------- <language-select> listen for language-selected
        // each flag is inside a shadowRoot, doesn't know the other elements
        // so we listen for the event on the document
        // then this.dialog is the proper reference to close the dialog
        this.$listen({
          type: _INTERNAL_EVENT_LANGUAGE_SELECT_BY_FLAG_,
          func: ({ detail }) => {
            console.log(
              `%c (document) Event: ${_EVENT_LANGUAGE_SELECTED_} `,
              "background:gold",
              detail
            );
            this.$emit({
              type: _EVENT_LANGUAGE_SELECTED_,
              detail, //: { language: detail.language, node: detail.node },
              scope: this,
            });

            // set the selected language on original <language-select>
            if (this.lshost) {
              this.lshost.label.textContent = detail.language;
              this.lshost.setAttribute("selected", detail.iso);
            }

            // Do not close the dialog, remove the whole <language-select-flags> element
            //dialog.close();
            this.$emit({
              type: _EVENT_REMOVE_,
              scope: this,
            });
          }, // func
        }); // listen
        this.$listen({
          type: _EVENT_REMOVE_,
          func: () => {
            this.remove();
          },
        });
      } // connectedCallback
      // ---------------------------------------------------------------------- showModal
      showModal() {
        // take "selected" attribute from <language-select> and set it on <language-selectors>
        // this will set the selected flag order to:1
        this.ALLSELECTORS.setAttribute(
          _ATTR_SELECTED_,
          this.getAttribute("selected")
        );
        if (this.dialog.showModal) this.dialog.showModal();
      } // showModal
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define

  // ************************************************************************** <language-selectors>
  customElements.define(
    _WC._LANGUAGE_SELECTORS_.name,
    class extends BaseClassElement {
      [_WCCALLBACK_CONNECTEDDONE_]() {
        // -------------------------------------------------------------------- loop all flags
        let LANGUAGES_ISO_CODES = Object.keys(this.lshost.languages);
        let isocodes = LANGUAGES_ISO_CODES;
        let languages = this.lshost.getAttribute("languages");
        let selectableLangs = languages?.split(",") || LANGUAGES_ISO_CODES;

        //* hardcode US,GB <flag is="duo"> so English is highlighted
        let styleselect = _WC._LANGUAGE_SELECTORS_.selected("gb", "duo");

        let UIis;
        let allflags = isocodes
          //.slice(0, 5)
          .map((is) => {
            if (is == "us" || is == "gb") {
              UIis = "duo";
            } else UIis = is;
            // ---------------------------------------------------------------- create CSS style selector for each
            styleselect += _WC._LANGUAGE_SELECTORS_.selected(UIis); // set selected flag
            // ------------------------------------------------------------------ create element
            let flag = createElement(_WC_FLAG_LANGUAGE_, {
              is, // ISO alpha 3 language code
              lshost: this.lshost,
            });
            flag.classList.toggle(
              _ATTR_SELECTABLE_,
              selectableLangs.includes(is)
            ); // non-selectable flags defaunt dimmed
            return flag;
          });
        // -------------------------------------------------------------------- append style and flags
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(_WC._LANGUAGE_SELECTORS_.css),
          createSTYLEElement(styleselect), // one CSS selector for every ISO code
          ...allflags
        ); // append
        this.onclick = () => {
          this.$emit({
            type: _EVENT_REMOVE_,
            scope: this,
          });
        };
      } // connectedCallback
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define

  // ************************************************************************** <flag-language>
  customElements.define(
    _WC._LANGSELECTORS_FLAG_.name,
    class extends BaseClassElement {
      [_WCCALLBACK_CONNECTEDDONE_]() {
        let is = this.is || "en"; // default to English
        if (is == "us" || is == "gb") is = "duo"; // create <flag-duo> for US,GB
        let language = this.lshost.languages[is] || "English";
        let img; // declare img to keep lets together
        // --------------------------------------------------------------------
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(_WC._LANGSELECTORS_FLAG_.css),
          (this.flag = createFlagMeisterFlag({
            is,
            part: "flag",
            alt: language,
            detail: 9999,
            lshost: this.lshost,
          })),
          createElement("div", { part: "label", textContent: language })
        );
        // -------------------------------------------------------------------- set IMG data
        img = this.flag.querySelector("img");
        if (img) {
          img.setAttribute("draggable", "false");
          img.setAttribute("alt", language);
        }
        // -------------------------------------------------------------------- set attributes
        // const $$attributes = (obj) =>
        //   Object.entries(obj).forEach(([key, value]) =>
        //     this.setAttribute(key, value)
        //   );
        this.setAttribute("is", is);
        this.setAttribute("alt", language);
        // -------------------------------------------------------------------- onclick
        this.onclick = () =>
          this.$emit({
            type: _INTERNAL_EVENT_LANGUAGE_SELECT_BY_FLAG_,
            detail: {
              iso: is == "duo" ? "en" : is, // US,GB -> English
              language,
              node: this, // unused, but could be used to set selected flag
            },
          });
      } // connectedCallback
      // -------------------------------------------------------------------- disconnectedCallback
      // called by BaseClass
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define

  // *************************************************************************** <flag-duo>
  customElements.define(
    "flag-duo",
    class extends HTMLElement {
      connectedCallback(
        // -------------------------------------------------------------------- get is
        is = this.getAttribute("is") || "us,gb", // default US,GB flags
        // -------------------------------------------------------------------- get one,two
        [one, two] = is.split(","), // one and two flags
        // -------------------------------------------------------------------- get polygon
        polygon = two == "gb"
          ? "100% 100%,-2% 100%,100%-1%" // custom polygon for GB
          : "100% 100%,0 100%,100% 0", // default polygon
        // -------------------------------------------------------------------- get split attribute
        // custom polygon values for Horizontal or Vertical split
        [HV, p1 = "50%", p2 = p1] = (this.getAttribute("split") || "").split(
          ":"
        )
      ) {
        // -------------------------------------------------------------------- proces split attribute
        if (HV == "v") {
          polygon = `${p1} 0, ${p2} 100%, 100% 100%, 100% 0`;
        } else if (HV == "h") {
          polygon = `0 ${p1}, 100% ${p2}, 100% 100%, 0 100%`;
        }
        // -------------------------------------------------------------------- create shadowDOM
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(
            `:host{position:relative;aspect-ratio:4/3}` +
              // position both flag- on top of each other
              `:host>*{position:absolute}` +
              // not exact diagonal, slight offset to show red GB line
              `[part="part2"]{clip-path:polygon(${polygon})}` +
              "img{width:95%}" +
              ""
          ),
          createFlagMeisterFlag({ is: one, part: "part1" }),
          createFlagMeisterFlag({ is: two, part: "part2" })
        );
      } // connectedCallback
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define

  // **************************************************************************** end IIFE
})();
