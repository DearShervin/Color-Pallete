//GLOBAL SELECTIONS
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeAdjustment = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const lockBtnInside = document.querySelectorAll('button.lock i')
let initialColors;

//EVENT LISTENERS :
generateBtn.addEventListener("click", randomColors); //Setting up the generate button.
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustBtn.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustment.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});
lockBtn.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    colorDivs[index].classList.toggle("locked");
  });
});
// lockBtnInside.forEach((btn, index) => {
//   btn.addEventListener('click', () => {
//     lockBtnInside[index].classList.replace("fas fa-lock-open", "fa-solid fa-lock")
//   });
// });
//FUNCTIONS :

//Color Generator with chroma.js :
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0]; //Selecting Hexes
    const randomColor = generateHex();
    //Adding it to the array :
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText); //So when we lock a color , its gonna push that color to the initialColors.
      return; //when you return , it does not do anything else.
    } else {
      initialColors.push(chroma(randomColor).hex()); //Now we have saved the original colors inside the array initialColors.
    }
    //Adding Color to the Background :
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //Checking Contrast :
    checkTextContrast(randomColor, hexText);
    //Initializing Colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //Resetting Our Inputs :
  resetInputs();
  //Check for Button Contrast :
  adjustBtn.forEach((btn, index) => {
    checkTextContrast(initialColors[index], btn);
    checkTextContrast(initialColors[index], lockBtn[index]);
  });
}
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Saturation :
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //Scale brightness :
  const midBright = color.set("hsl.s", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  //Update Input Colors :
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue"); //Getting the index of each slider
  let slider = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = slider[0];
  const brightness = slider[1];
  const saturation = slider[2];
  const bgColor = initialColors[index]; //Here we are using the initial color as the main color that changes so when we go complete dark or white , when we wanna go back to other colors we can do it.
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorDivs[index].style.backgroundColor = color;
}
function updateTextUI(index) {
  const activeDiv = colorDivs[index]; //Selecting the color from the background
  const color = chroma(activeDiv.style.backgroundColor); //Giving the bg color to chroma
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex(); //Converting to hex
  //Checking Contrast :
  checkTextContrast(color, textHex);
}
function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")]; // this is the number of the color 1 of the 5 colors that we have.
      const hueValue = chroma(hueColor).hsl()[0]; //hsl is : h = hue , s = saturation , l = brightness , and index 0 is hue.
      slider.value = Math.floor(hueValue); // now our hue slider is exactly where it should be according to our random color.
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2]; // hsl => h (hue )= 0, s (saturation) = 1, l (brightness) = 2
      slider.value = Math.floor(brightValue * 100) / 100; // we multiplied by 100 and divided so we would get 2 decimals.
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}
function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  //Pop Up Animation :
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

randomColors();