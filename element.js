!(function ({
  Array,
  console,
  customElements,
  CustomEvent,
  document,
  fetch,
  HTMLElement,
  localStorage,
  location,
  Object,
  navigator,
  setTimeout,
  URLSearchParams,
  Promise,
} = window) {
  // ============================================================================ languages
  let alllanguages = {
    nl: "Nederlands",
    gb: "English",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    es: "Español",
    jp: "日本語",
    pl: "Polski",
    ro: "Română",
    hu: "Magyar",
    cz: "Čeština",
    sk: "Slovenčina",
    sl: "Slovenščina",
    hr: "Hrvatski",
    bg: "Български",
    lv: "Latviešu",
    lt: "Lietuvių",
    ee: "Eesti",
    fi: "Suomi",
    se: "Svenska",
    dk: "Dansk",
    no: "Norsk",
    is: "Íslenska",
    mt: "Malti",
    gr: "Ελληνικά",
    ru: "Русский",
    cn: "中文",
    sa: "العربية",
    bn: "বাংলা",
    pk: "اردو", // Urdu
    ir: "فارسی",
    il: "עברית",
    th: "ไทย",
    vn: "Tiếng Việt",
    kr: "한국어",
    et: "አማርኛ", // Amharic
  };
  // ============================================================================ Helper Functions
  const createElement = (tag, props = {}) => {
    let el = document.createElement(tag);
    if (props.append) {
      el.append(...props.append);
      delete props.append;
    }
    return Object.assign(el, props);
  };
  // ------------------------------------------------------------------------ createSTYLEElement
  const createSTYLEElement = (textContent, props = {}) =>
    createElement("style", { textContent, ...props });

  // ============================================================================ create <flag-xx> elements
  const createFlagMeisterFlag = ({
    is,
    part = "flag-" + is,
    flag = createElement("flag-" + is),
    detail = 9999, // prevent loading of detailed flags
  }) => {
    flag.setAttribute("detail", detail); // prevent loading of detailed flags
    flag.setAttribute("part", part); // for shadowDOM styling
    return flag;
  };
  // ============================================================================ WC
  const _WCCALLBACK_CONNECTEDDONE_ = "connectedDoneCallback",
    _WCCALLBACK_RENDERED_ = "renderedCallback";
  // ============================================================================ Events
  // emitted to public application
  const _EVENT_LANGUAGE_SELECTED_ = "language-selected";
  // internal events
  const _INTERNAL_EVENT_LANGUAGE_SELECT_BY_FLAG_ = "language-selected-by-flag";
  // ============================================================================ Attributes
  // public attribute
  const _ATTR_SELECTED_ = "selected";
  // ============================================================================ Web Components
  const _WC_FLAG_LANGUAGE_ = "flag-language";
  const _WC = {
    LANGSELECT_: {
      name: "language-select",
      css:
        ":host{--selectcolor:lightgreen;--flagbackground:lightgrey}" +
        // <dialog>
        `[part="dialog"]{width:70vw;max-width:70%;padding:.5em 1em;position:relative;user-select:none}` +
        `[part="dialog"]{border:none;border-radius:6px;box-shadow:0 4px 4px rgba(0,0,0,0.2)}` +
        // dialog::backdrop
        `[part="dialog"]::backdrop{background:rgba(0,0,0,0.7)}` +
        // language-select button
        `svg{width:10%;cursor:pointer}` +
        // title inside dialog
        `[part="title"]{text-align:center}`,
    },
    LANGSELECTORS_: {
      name: "language-selectors",
      css:
        ":host{display:grid;grid:1fr/repeat(var(--columncount,8),1fr);gap:1em .5em}" +
        "@media (max-width:1200px){:host{--columncount:7}}" +
        "@media (max-width:950px){:host{--columncount:6}}" +
        "@media (max-width:700px){:host{--columncount:4}}",
    },
    LANGSELECTORS_FLAG: {
      name: _WC_FLAG_LANGUAGE_,
      css:
        // flag image + language label
        `:host{display:grid;grid-template-columns:1fr;padding:.5em}` +
        `:host{order:2;cursor:pointer;background:var(--flagbackground,lightgrey)}` +
        `.selected{background:var(--selectcolor)}` +
        // flag
        //`[part="flag"]{transition:transform 0.2s;display:block;width:100%;aspect-ratio:4/3}` +
        `[part="flag"]{box-shadow:0 2px 4px rgba(0, 0, 0, 0.9)}` +
        //
        `:host(:hover) [part="flag"]{transform:scale(1.1)}` +
        // center label below flag
        `[part="label"]{display:flex;align-items:center;justify-content:center;height:100%}`,
    },
  };

  // ============================================================================ BaseClassElement
  // BaseClass for all Web Components
  const BaseClassElement = class extends HTMLElement {
    // ------------------------------------------------------------------------ listen
    $listen({ type, func, scope = document, options = {} }) {
      scope.addEventListener(type, func, options);
      let remove = () => scope.removeEventListener(type, func, options);
      this.listeners = this.listeners || [];
      this.listeners.push(remove);
      return remove;
      // ------------------------------------------------------------------------ removeListeners
      // this.listeners?.forEach((remove) => remove());
    }
    $emit({
      type = "CustomEvent",
      detail = {},
      bubbles = true,
      composed = true,
      scope = this,
    }) {
      scope.dispatchEvent(new CustomEvent(type, { detail, bubbles, composed }));
    }
    // ------------------------------------------------------------------------ BaseClass
    static get observedAttributes() {
      return [_ATTR_SELECTED_];
    }
    // ------------------------------------------------------------------------ BaseClass
    attributeChangedCallback(name, oldValue, newValue) {
      console.error("attributeChangedCallback", name, oldValue, newValue);
      if (name == _ATTR_SELECTED_) {
        this.$emit({
          type: _EVENT_LANGUAGE_SELECTED_,
          detail: { language: newValue, node: this },
        });
      }
    }
    // ------------------------------------------------------------------------ BaseClass
    connectedCallback() {
      if (!this.is) console.log("connectedCallback", this.nodeName);
      if (this[_WCCALLBACK_CONNECTEDDONE_]) this[_WCCALLBACK_CONNECTEDDONE_]();
      // wait till innerHTML is parsed
      if (this[_WCCALLBACK_RENDERED_])
        setTimeout(() => this[_WCCALLBACK_RENDERED_](), 1);
    } // connectedCallback
    // ------------------------------------------------------------------------ BaseClass
    disconnectedCallback() {
      this.listeners?.forEach((remove) => remove());
    } // disconnectedCallback
  }; // BaseClassElement
  // ========================================================================== <language-select>
  customElements.define(
    _WC.LANGSELECT_.name,
    class LanguageSelector extends BaseClassElement {
      // ---------------------------------------------------------------------- connectedCallback
      [_WCCALLBACK_CONNECTEDDONE_]() {
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(_WC.LANGSELECT_.css),
          createElement("button", {
            part: "button",
            innerHTML:
              `<svg part="svg" viewBox="0 0 600 600">` +
              `<path part="path" d="m178 213c-1-1 1 9 5 13 6 6 11 7 14 7 6 0 13-1 17-3 4-2 11-5 14-11 1-1 2-3 1-8-1-4-3-5-6-5-3 0-12 3-16 4-4 1-13 4-17 5-3 1-11-1-12-2zm106 121c-2-1-36-15-41-17-4-2-14-6-18-8 13-20 21-35 22-37 2-4 16-31 16-33 0-2 1-8 0-9 0-1-5 1-12 4-7 2-20 11-25 12-5 1-21 7-29 10-8 3-24 7-30 9-6 2-12 2-16 3 0 0 0 5 1 7 1 2 4 5 8 6 4 1 10 1 13 0 3-1 8-3 9-4 1-1 0-5 1-6 1-1 17-5 23-6 6-2 29-10 32-9-1 3-19 39-25 50-6 11-40 58-47 66-6 6-19 23-23 26 1 0 9 0 11-1 9-6 25-25 30-31 15-18 28-36 38-52h0c2 1 18 14 23 17 4 3 21 12 25 14 4 2 18 8 18 6 1-4-2-17-4-17zm-79 178c3 2 6 4 10 5 7 3 15 7 22 10 10 4 20 7 31 9 6 1 12 2 18 3 1 0 17 2 20 2h16c6-1 12-1 19-2 5-1 11-2 16-3 4-1 8-2 12-3 4-1 8-3 12-4 3-1 6-2 9-3 2-1 5-2 8-3 3-1 7-3 11-5 3-1 6-3 16-9 6 10 5 9 5 9-9 6-14 8-17 10-7 4-15 7-22 10-9 3-20 7-29 9-3 1-7 2-10 2-2 0-21 3-26 3h-24c-6-1-13-1-20-2-6-1-12-2-17-3-4-1-9-2-13-3-7-2-14-5-21-7-13-5-26-11-38-19-2-1-2-3-2-5 0-3 2-5 5-5 2-1 8 4 9 4zm335-332-41-13v-119c0-3-3-6-6-6-3 0-85 28-91 31-22 7-87 30-87 30l0 0c-1 0-3 1-5 1l-157-55c-1 0-2 0-2 2v2 105c-24 8-42 14-43 14-2 1-4 1-6 3-1 1-1 2-1 3v306c0 0 0 1 0 1 1 2 3 4 5 4 3 0 208-69 213-71 0 0 0 0 1 0l219 70c1 0 2-1 2-2v-304c0-1 0-1-1-2zm-229 229-199 66v-293l199-66v293zm177-353v108l-164-52 164-56zm-20 329-11-38-61-18-13 31-29-9 62-153 29 9 52 187-29-9zm-56 103 30 49 16-46zm-5-188 40 12-18-65z" />` +
              `</svg>`,
            onclick: () => this.showModal(),
          }),
          (this.dialog = createElement("dialog", {
            part: "dialog",
            append: [
              // createElement("form", {
              //   append: [
              createElement("h2", {
                part: "title",
                textContent:
                  this.getAttribute("caption") || "Select Your Language",
              }),
              (this.allselectors = createElement(_WC.LANGSELECTORS_.name, {
                languages: this.getAttribute("languages"),
              })),
            ],
            // }), // "form"
            // ], // form .append
            onclick: (event) => {
              if (event.target === this.dialog) this.dialog.close();
            },
          })) // "dialog"
        );
        // -------------------------------------------------------------------- <language-select> listen for language-selected
        this.$listen({
          type: _INTERNAL_EVENT_LANGUAGE_SELECT_BY_FLAG_,
          func: ({ detail }) => {
            this.setAttribute(_ATTR_SELECTED_, detail.language);
            this.dialog.close();
          },
        });
        this.showModal();
      }
      // ---------------------------------------------------------------------- showModal
      showModal() {
        // take "selected" attribute from <language-select> and set it on <language-selectors>
        // this will set the selected flag order to:1
        this.allselectors.setAttribute(
          _ATTR_SELECTED_,
          this.getAttribute("selected")
        );
        if (this.dialog.showModal) this.dialog.showModal();
      } // showModal
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define
  // ========================================================================== <language-selectors>
  customElements.define(
    _WC.LANGSELECTORS_.name,
    class extends BaseClassElement {
      [_WCCALLBACK_CONNECTEDDONE_]() {
        // -------------------------------------------------------------------- loop all flags
        // -------------------------------------------------------------------- create CSS style selector for each
        let languages = this.languages?.split(",") || "*";
        let isocodes = languages == "*" ? Object.keys(alllanguages) : languages;
        console.error(
          "use only langs defined in attribute 'languages'",
          this.languages,
          isocodes
        );
        let styleselect = "";
        let allflags = isocodes
          //.slice(0, 5)
          .map((is) => {
            styleselect += `:host([selected*='${is}']) ${_WC_FLAG_LANGUAGE_}[is='${is}']{order:1;background:var(--selectcolor)}`; // set selected flag
            return createElement(_WC_FLAG_LANGUAGE_, {
              is, // ISO alpha 3 language code
            });
          });
        // -------------------------------------------------------------------- append style and flags
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(_WC.LANGSELECTORS_.css),
          createSTYLEElement(styleselect), // one CSS selector for every ISO code
          ...allflags
        );
      } // connectedCallback
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define
  // ========================================================================== <flag-language>
  customElements.define(
    _WC.LANGSELECTORS_FLAG.name,
    class extends BaseClassElement {
      [_WCCALLBACK_CONNECTEDDONE_]() {
        let is = this.is || "en"; // default to English
        if (is == "us" || is == "gb") is = "duo"; // create <flag-duo> for US,GB
        let language = alllanguages[is] || "English";
        let img; // declare img to keep lets together
        // --------------------------------------------------------------------
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(_WC.LANGSELECTORS_FLAG.css),
          (this.flag = createFlagMeisterFlag({
            is,
            part: "flag flag-" + is,
            alt: language,
            detail: 9999,
          })),
          createElement("div", { part: "label", textContent: language })
        );
        // -------------------------------------------------------------------- <flag-language> set IMG data
        img = this.flag?.querySelector("img");
        img?.setAttribute("draggable", "false");
        img?.setAttribute("alt", language);
        // -------------------------------------------------------------------- <flag-language> set attributes
        // const $$attributes = (obj) =>
        //   Object.entries(obj).forEach(([key, value]) =>
        //     this.setAttribute(key, value)
        //   );
        this.setAttribute("is", is);
        this.setAttribute("alt", language);
        // -------------------------------------------------------------------- <flag-language> onclick
        this.onclick = () =>
          this.$emit({
            type: _INTERNAL_EVENT_LANGUAGE_SELECT_BY_FLAG_,
            detail: { language: is, node: this },
          });
      } // connectedCallback
      // -------------------------------------------------------------------- <flag-language> disconnectedCallback
      disconnectedCallback() {
        this.listeners?.forEach((remove) => remove());
      } // disconnectedCallback
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define

  // *************************************************************************** <flag-duo>
  customElements.define(
    "flag-duo",
    class extends HTMLElement {
      connectedCallback(
        // -------------------------------------------------------------------- <flag-duo> get is
        is = this.getAttribute("is") || "us,gb", // default US,GB flags
        // -------------------------------------------------------------------- <flag-duo> get one,two
        [one, two] = is.split(","), // one and two flags
        // -------------------------------------------------------------------- <flag-duo> get polygon
        polygon = two == "gb"
          ? "100% 100%,-2% 100%,100%-1%" // custom polygon for GB
          : "100% 100%,0 100%,100% 0", // default polygon
        // -------------------------------------------------------------------- <flag-duo> get split attribute
        // custom polygon values for Horizontal or Vertical split
        [HV, p1 = "50%", p2 = p1] = (this.getAttribute("split") || "").split(
          ":"
        )
      ) {
        // -------------------------------------------------------------------- <flag-duo> proces split attribute
        if (HV == "v") {
          polygon = `${p1} 0, ${p2} 100%, 100% 100%, 100% 0`;
        } else if (HV == "h") {
          polygon = `0 ${p1}, 100% ${p2}, 100% 100%, 0 100%`;
        }
        // -------------------------------------------------------------------- <flag-duo> create shadowDOM
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(
            `:host{max-width:20vw;display:inline-block;position:relative;aspect-ratio:4/3}` +
              `:host>*{position:absolute;left:0;width:100%;height:auto}` +
              // not exact diagonal, slight offset to show red GB line
              `[part="part2"]{clip-path:polygon(${polygon})}` +
              ``
          ),
          createFlagMeisterFlag({ is: one, part: "part1" }),
          createFlagMeisterFlag({ is: two, part: "part2" })
        );
      } // connectedCallback
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define
  // ============================================================================ end IIFE
})();
