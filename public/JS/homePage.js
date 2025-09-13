function previewImage(event) {
  const preview = document.getElementById("preview");
  const img = document.getElementById("preview-img");
  img.src = URL.createObjectURL(event.target.files[0]);
  preview.style.display = "block";
}
