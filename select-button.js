// ========================================================================== How to publish
// Minifiy this file (button left bottom in VScode)
// Git push button.min.js

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
    // CustomEvent,
    // setTimeout,
    performance,
    console,
    Promise,
    customElements,
    document,
    HTMLElement,
    Object,
  } = window
) {
  const _isDEV_ = location.host.includes("127");

  // ****************************************************************************

  // https://language-select.github.io/button.min.js

  // <language-select selected="nl" languages="nl,pt,es,de,eu" [options] ></language-select>

  // create first UI:

  // 1. <language select options > creates standard <select><option> elements

  // 2. when using SVG button, the flagmeister and flags.js components are loaded after a click
  // this reduces the amount of code loaded initially
  // but does cause a acceptable? delay when the button is clicked

  // host:this is passed to other/loaded components as property

  // Web Component name, and derived strings
  const _LANGUAGE_SELECT_ = "language-select";

  // dependency Web Component from https://language-select.github.io/flags.min.js
  // **************************************************************************
  const __FLAGS_JS_ = `./select-flags${_isDEV_ ? "" : ".min"}.js`;
  // **************************************************************************

  const _WC_SELECT_FLAGS_ = "language-select-flags";
  // this one also load FlagMeister dependency (once)
  // flag-[iso] Web Components from https://flagmeister.github.io/elements.flagmeister.min.js
  const _SVG_FLAGS_ =
    "https://flagmeister.github.io/elements.flagmeister.min.js";

  // ========================================================================== CSS
  // parts: div, svg, label
  const _SVG_BUTTON_LABEL_CSS_ = // user styling and interaction
    `:host{display:inline-block;border:1px solid #ccc;border-radius:3px}` +
    `:host{user-select:none;cursor:pointer}` + // user interaction
    `:host(:hover){background:var(--${_LANGUAGE_SELECT_}-hover,#f0f0f0)}` +
    //`:host(:active){var(--language-select-active,background:#e0e0e0)}` +
    `[part="labeliso"]{display:none}[part="labellanguage"]{display:inherit}` +
    `@media (max-width:500px){[part="labeliso"]{display:inherit}[part="labellanguage"]{display:none}}` +
    // style container as 2 column grid
    `div{width:fit-content;display:grid;gap:4px;grid:1fr/auto 1fr;align-items:center}` +
    // label styling
    `span{padding:4px 4px}` + // now as gap
    // SVG styling
    `[part="path"]{fill:currentColor}` + // let user color: style icon
    "";

  const createElement = (
    tag,
    { append = [], style = {}, attrs = {}, ...props } = {},
    element = document.createElement(tag) // create or use existing element
  ) => {
    element.append(...append);
    return Object.assign(element, props);
  };

  customElements.define(
    _LANGUAGE_SELECT_,
    class extends HTMLElement {
      connectedCallback() {
        // ====================================================================== this.alllanguages
        this.languages = {
          nl: "Nederlands",
          en: "English",
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
          il: "עברית", // Hebrew
          sa: "العربية",
          bn: "বাংলা",
          pk: "اردو", // Urdu
          ir: "فارسی", // Farsi
          th: "ไทย",
          vn: "Tiếng Việt",
          kr: "한국어",
          et: "አማርኛ", // Amharic
        };
        // ======================================================================
        // cool helper function to create elements with properties
        // ======================================================================
        // preset variable for if/then/else
        let elements;
        // ----------------------------------------------------------------------- handle all languages to display
        let languages = this.getAttribute("languages")
          .replace("gb", "en")
          .replace("us", "en");

        languages = languages
          ? languages.split(",")
          : Object.keys(this.languages);

        if (this.hasAttribute("exclude")) {
          let exclude = this.getAttribute("exclude") || "";
          let excludeSet = new Set(exclude.split(","));
          languages = languages.filter((lang) => !excludeSet.has(lang));
          this.languages = languages.reduce((acc, lang) => {
            acc[lang] = this.languages[lang];
            return acc;
          }, {});
        }

        // -------------------------------------------------------------------- using <select><option>
        if (this.hasAttribute("options")) {
          elements = [
            createElement("style", {
              textContent:
                `:host{display:flex;flex-direction:column;gap:4px;align-items:center}` +
                `select{background-color:transparent;border:none;cursor:pointer;margin-left:10px}`,
            }),
            (this.select = createElement("select", {
              part: "select",
              append: [
                ...languages.map((value) =>
                  // -------------------------------------------------------------------- create <select><option>
                  createElement("option", {
                    value,
                    textContent: this.languages[value],
                  })
                ),
              ],
              onchange: (event) => {
                this.dispatchEvent(
                  new CustomEvent(_LANGUAGE_SELECT_, {
                    detail: {
                      iso: event.target.value,
                      language: this.languages[event.target.value],
                    },
                  })
                );
              },
            })), // select
          ];
          this.attachShadow({ mode: "open" }).append(...elements);
        } else {
          // -------------------------------------------------------------------- create SVG icon and label

          //method to (re)set the label and short iso code
          this.label = (iso = "en") => {
            this.shadowRoot.querySelector("[part=labeliso]").textContent =
              iso.toUpperCase();
            this.shadowRoot.querySelector("[part=labellanguage]").textContent =
              this.languages[iso];
          };

          // elements for SVG button
          elements = [
            createElement("style", {
              textContent: _SVG_BUTTON_LABEL_CSS_,
            }),
            createElement("div", {
              // container required for proper SVG usage
              part: "div",
              // use innerHTML so SVG gets the correct SVG NameSpace, createElement makes it an HTML element
              innerHTML:
                `<svg part="svg" viewBox="0 0 600 600" style="height:100%">` +
                `<path part="path" d="m178 213c-1-1 1 9 5 13 6 6 11 7 14 7 6 0 13-1 17-3 4-2 11-5 14-11 1-1 2-3 1-8-1-4-3-5-6-5-3 0-12 3-16 4-4 1-13 4-17 5-3 1-11-1-12-2zm106 121c-2-1-36-15-41-17-4-2-14-6-18-8 13-20 21-35 22-37 2-4 16-31 16-33 0-2 1-8 0-9 0-1-5 1-12 4-7 2-20 11-25 12-5 1-21 7-29 10-8 3-24 7-30 9-6 2-12 2-16 3 0 0 0 5 1 7 1 2 4 5 8 6 4 1 10 1 13 0 3-1 8-3 9-4 1-1 0-5 1-6 1-1 17-5 23-6 6-2 29-10 32-9-1 3-19 39-25 50-6 11-40 58-47 66-6 6-19 23-23 26 1 0 9 0 11-1 9-6 25-25 30-31 15-18 28-36 38-52h0c2 1 18 14 23 17 4 3 21 12 25 14 4 2 18 8 18 6 1-4-2-17-4-17zm-79 178c3 2 6 4 10 5 7 3 15 7 22 10 10 4 20 7 31 9 6 1 12 2 18 3 1 0 17 2 20 2h16c6-1 12-1 19-2 5-1 11-2 16-3 4-1 8-2 12-3 4-1 8-3 12-4 3-1 6-2 9-3 2-1 5-2 8-3 3-1 7-3 11-5 3-1 6-3 16-9 6 10 5 9 5 9-9 6-14 8-17 10-7 4-15 7-22 10-9 3-20 7-29 9-3 1-7 2-10 2-2 0-21 3-26 3h-24c-6-1-13-1-20-2-6-1-12-2-17-3-4-1-9-2-13-3-7-2-14-5-21-7-13-5-26-11-38-19-2-1-2-3-2-5 0-3 2-5 5-5 2-1 8 4 9 4zm335-332-41-13v-119c0-3-3-6-6-6-3 0-85 28-91 31-22 7-87 30-87 30l0 0c-1 0-3 1-5 1l-157-55c-1 0-2 0-2 2v2 105c-24 8-42 14-43 14-2 1-4 1-6 3-1 1-1 2-1 3v306c0 0 0 1 0 1 1 2 3 4 5 4 3 0 208-69 213-71 0 0 0 0 1 0l219 70c1 0 2-1 2-2v-304c0-1 0-1-1-2zm-229 229-199 66v-293l199-66v293zm177-353v108l-164-52 164-56zm-20 329-11-38-61-18-13 31-29-9 62-153 29 9 52 187-29-9zm-56 103 30 49 16-46zm-5-188 40 12-18-65z" />` +
                `</svg>` +
                `<span part="labeliso"></span>` +
                `<span part="labellanguage"></span>`,
            }),
          ];

          // ====================================================================== create shadow DOM
          this.attachShadow({ mode: "open" }).append(...elements);
          this.label(this.getAttribute("selected") || "en");

          // export parts out of shadowDOM to host component
          // should be done in the shadowDOM of parent web component
          //this.setAttribute("exportparts", "div, svg, path, label");

          // ====================================================================== UI user click
          this.onclick = () => {
            // ------------------------------------------------------------------ inject Web Component
            let selectorFlags = createElement(_WC_SELECT_FLAGS_, {
              host: this, // pass this component as host reference
            });
            // pass attributes  to <selected-language-flag>
            ["selected", "languages", "caption"].map((attr) => {
              if (this.hasAttribute(attr))
                selectorFlags.setAttribute(attr, this.getAttribute(attr));
            });

            // append to whole body, the WC will remove() itself when done
            document.body.append(selectorFlags);
            // issue with append inside WC, flags are huge
            // append inside WC to make exportparts work better has an issue;
            // <dialog> goes fullsreen but without the proper layout, flags are huge
            //this.shadowRoot.append(selectorFlags);

            // ------------------------------------------------------------------ test performance loadin dependencies
            performance.mark(_WC_SELECT_FLAGS_);
            if (!customElements.get(_WC_SELECT_FLAGS_)) {
              // if the Web Component is not defined, load it [async]
              // load both flagmeister and flags.nl
              Promise.all([
                import(_SVG_FLAGS_), // import FlagMeister
                import(__FLAGS_JS_), // import flags.js or flags.min.js
              ])
                .then(() =>
                  // the <language-select-flags> Web Component is (undefined) in the DOM
                  // will automagically upgrade, so nothing to do here
                  console["warn"](
                    _WC_SELECT_FLAGS_,
                    `load: ${~~performance.measure(_WC_SELECT_FLAGS_)
                      .duration}ms`
                  )
                )
                .catch((error) => {
                  console.error(error);
                });
            }
          }; // onclick
        } // if-else

        // ======================================================================
      } // connectedCallback
    } // class
  ); // customElements.define

  // ****************************************************************************
})();
