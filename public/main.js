/// <reference lib="dom" />
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

$('input[type="checkbox"]#select-all')?.addEventListener('change', (event) => {
  const checked = event.target.checked;
  const checkboxes = $$('input[type="checkbox"]:not(#select-all)');
  for (const checkbox of checkboxes) {
    if (checked) {
      checkbox.setAttribute('checked', 'checked');
    } else {
      checkbox.removeAttribute('checked');
    }
  }
});
