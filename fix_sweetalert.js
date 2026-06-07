const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/subjects/client.tsx', 'utf8');

const searchName = `<input type="text" id="swal-edit-subject-name" class="swal2-input" value="\${sub.name}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>`;
const replaceName = `<input type="text" id="swal-edit-subject-name" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>`;

const searchCode = `<input type="text" id="swal-edit-subject-code" class="swal2-input" value="\${sub.code || ''}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>`;
const replaceCode = `<input type="text" id="swal-edit-subject-code" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>`;

const searchTingkat = `<input type="text" id="swal-edit-subject-tingkat" class="swal2-input" value="\${sub.tingkatKelas || ''}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>`;
const replaceTingkat = `<input type="text" id="swal-edit-subject-tingkat" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>`;


const searchEdit = `    Swal.fire({
      title: "Edit Mata Pelajaran",
      html: \``;
const replaceEdit = `    Swal.fire({
      title: "Edit Mata Pelajaran",
      didOpen: () => {
        const nameInput = document.getElementById("swal-edit-subject-name") as HTMLInputElement;
        if (nameInput) nameInput.value = sub.name || "";

        const codeInput = document.getElementById("swal-edit-subject-code") as HTMLInputElement;
        if (codeInput) codeInput.value = sub.code || "";

        const tingkatInput = document.getElementById("swal-edit-subject-tingkat") as HTMLInputElement;
        if (tingkatInput) tingkatInput.value = sub.tingkatKelas || "";
      },
      html: \``;

content = content.replace(searchName, replaceName);
content = content.replace(searchCode, replaceCode);
content = content.replace(searchTingkat, replaceTingkat);
content = content.replace(searchEdit, replaceEdit);

fs.writeFileSync('src/app/(dashboard)/subjects/client.tsx', content);
