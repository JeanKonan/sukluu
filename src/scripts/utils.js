export async function renderWithTemplate(
    templateFn,
    parentElement,
    data,
    callback,
    position = "afterbegin",
    clear = true
  ) {
    if (clear) {
      parentElement.innerHTML = "";
    }
    const htmlString = await templateFn(data);
    parentElement.insertAdjacentHTML(position, htmlString);
    if (callback) {
      callback(data);
    }
  }

function loadTemplate(path) {
    // wait what?  we are returning a new function? this is called currying and can be very helpful.
    return async function () {
      const res = await fetch(path);
      if (res.ok) {
        const html = await res.text();
        return html;
      }
    };
}

export async function loadHeaderFooter() {
    // header template will still be a function! But one where we have pre-supplied the argument.
    // headerTemplate and footerTemplate will be almost identical, but they will remember the path we passed in when we created them
    // why is it important that they stay functions?  The renderWithTemplate function is expecting a template function...if we sent it a string it would break, if we changed it to expect a string then it would become less flexible.
    const headerTemplateFn = loadTemplate("/partials/header.html");
    const footerTemplateFn = loadTemplate("/partials/footer.html");
    const headerEl = document.querySelector("#main-header");
    const footerEl = document.querySelector("#main-footer");
    renderWithTemplate(headerTemplateFn, headerEl);
    renderWithTemplate(footerTemplateFn, footerEl);
  }