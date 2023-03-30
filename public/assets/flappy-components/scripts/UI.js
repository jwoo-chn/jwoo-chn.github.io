const mask = document.getElementById('mask');
const menu = document.getElementById('mainMenu');
const editWindow = document.getElementById("configWindow");
const pauseBtn = document.getElementById("pauseBtn");
const configWindow = document.getElementById("configWindow");

var UIconfig;
var inputObjs = []; //a maintained list of all the input objects for easy access

//Parent class of all input elements
class Input {
  //All inputs share in common a title and a description
  constructor(title, desc) {
    this.title = title;
    this.desc = desc;

    //Add this object to the list of all input objects
    inputObjs.push(this);
  }
}

//Represents a range slider, which not only forces the input to be a number but also gives an easy way for users to change simulation properties
class Slider extends Input {
  constructor(control, title, desc, range, init) {
    super(title, desc);

    this.range = range; //represents the inclusive range [l, r]
    this.init = init; //initial value

    this.control = control; //the attribute which is being controlled

    //Each of these will eventually store HTML elements relevant to the slider.
    this.inputElement, this.titleElement, this.descElement, this.valueElement;

    //this.element represents the actual slider HTML element itself.
    this.element = this.makeElement();
  }

  //Returns an HTML div that houses the title, description, and range slider
  makeElement() {
    //The variable to be returned
    let ret = document.createElement('div');
    
    ret.className = 'configInputWrapper';

    //leftSide and rightSide represent the left and right sides of the input element.
    //The left side houses the title and description while the right side houses the actual range slider.
    let leftSide = document.createElement('div');
    let rightSide = document.createElement('div');

    //Create the title and description elements
    this.titleElement = document.createElement('div');
    this.descElement = document.createElement('div');

    this.titleElement.innerHTML = this.title + ': ';
    this.titleElement.className = 'configPropertyTitle';
    this.descElement.innerHTML = this.desc;
    this.descElement.className = 'configPropertyDesc';

    leftSide.style.width = '50%';
    leftSide.className = 'rightSideBorder';
    rightSide.style.width = '50%';
    rightSide.style.padding = '1rem 1.5rem .8rem 1rem';

    leftSide.appendChild(this.titleElement);
    leftSide.appendChild(this.descElement);

    //this.valueElement simply holds the current value of the slider
    this.valueElement = document.createElement('span');
    this.valueElement.style.color = 'rgb(0,200,255)';

    let outputVal = this.init;
    if (this.control == "mutationRate")
      outputVal += "%";
    
    this.valueElement.innerHTML = outputVal;

    this.titleElement.appendChild(this.valueElement);

    //Create the actual slider element
    let inp = document.createElement("input");
    inp.type = "range";
    inp.min = this.range[0];
    inp.max = this.range[1];
    inp.value = this.init;
    
    if (this.control == "mutationRate")
      inp.value = this.init;
    
    inp.className = "configSlider";

    //When the slider element is interacted with, call the .oninput() function
    inp.oninput = () => {
      this.oninput();
    }

    this.inputElement = inp;

    //Build the div hierarchy
    rightSide.appendChild(inp);
    ret.appendChild(leftSide);
    ret.appendChild(rightSide);

    return ret;
  }

  //Run whenever the slider element is interacted with and its value has changed
  oninput() {
    //For most sliders, simply update a given property (this.control) with the current slider value
    gameHandler[this.control] = Number(this.inputElement.value);

    let outputVal = this.inputElement.value;

    //The following if/else statements handle edge cases where more things need to be modified
    if(this.control == "numBirds"){
      let numBirds = Number(this.inputElement.value);

      if (numBirds == config.populationSize)
        return;
      
      config.populationSize = numBirds;
      brain = new NEAT(config);

      gameHandler = createHandler();
      gameHandler.numBirds = numBirds;
      gameHandler.init();
      UIconfig.enforce();
    }
    else if(this.control == "mutationRate"){
      let mutationRate = Number(this.inputElement.value)/100;

      if (mutationRate == config.mutationRate)
        return;

      config.mutationRate = mutationRate;
      brain = new NEAT(config);
      gameHandler = createHandler();
      gameHandler.mutationRate = mutationRate;
      
      UIconfig.enforce();

      gameHandler.init();
      outputVal += "%";
    }

    //Update the displayed value
    this.valueElement.innerHTML = outputVal;
  }
  //Enforces the current input values whenever the simulation restarts
  enforce() {
    this.oninput();
  }
}

class Button extends Input {
  constructor(callback, title, desc) {
    super(title, desc);

    this.callback = callback; //callback is called whenever the button is clicked

    //Will be set to the element that represents the description of the button
    this.descElement;

    this.element = this.makeElement(); //The actual button element
  }

  //Returns an HTML div that houses the description and button
  makeElement() {
    //The variable to be returned
    let ret = document.createElement('div');
    
    ret.className = 'configInputWrapper';

    //leftSide and rightSide represent the left and right sides of the input element.
    //The left side houses the actual button while the right side houses the button description.
    let leftSide = document.createElement('div');
    let rightSide = document.createElement('div');

    //Create the description element
    this.descElement = document.createElement('div');
    this.descElement.innerHTML = this.desc;
    this.descElement.className = 'configPropertyDesc';

    //Styling the left and right side divs
    leftSide.style.width = '30%';
    rightSide.style.width = '60%';
    rightSide.style.padding = '.5rem .6rem';

    //Create the button element
    let bt = document.createElement('button');

    bt.className = "configButton";
    bt.innerHTML = this.title;

    //When the button is clicked, call this.onclick();
    bt.onclick = () => {
      this.onclick();
    }

    //Build the div hierarchy
    rightSide.appendChild(this.descElement);
    leftSide.appendChild(bt);
    ret.appendChild(leftSide);
    ret.appendChild(rightSide);

    return ret;
  }

  //Run whenever the button is clicked
  onclick() {
    //Execute the specified callback 
    this.callback();
  }

  //Enforces the current input values whenever the simulation restarts
  //In the case of a button, nothing needs to be done - this function only exists for consistency between Input classes
  enforce() {
    
  }
}

class ConfigTab {
  constructor(title, inputs) {
    this.title = title;
    this.inputs = inputs; //contains a list of input elements

    this.bodyElement = this.makeBodyElement(); //this.bodyElement represents the content of a tab
    this.tabElement = this.makeTabElement(); //this.tabElement represents the tab button
  }
  makeBodyElement() {
    //The variable to be returned
    let ret = document.createElement('div');

    ret.className = "configTabBody";

    //Interate through all the inputs that should be added into the tab body
    for (let i = 0; i < this.inputs.length; i++) {
      ret.appendChild(this.inputs[i].element);
    }

    //Set the body to be hidden by default
    ret.style.display = 'none';

    return ret;
  }
  makeTabElement() {
    //The variable to be returned
    let ret = document.createElement('button');

    ret.className = "configTab";
    ret.innerHTML = this.title;

    //When the tab button is clicked, switch to that tab
    ret.onclick = () => {
      //Iterate through each tab and deactivate all of them
      for (let t in UIconfig.tabsByTitle) {
        UIconfig.tabsByTitle[t].bodyElement.style.display = 'none';
        UIconfig.tabsByTitle[t].tabElement.className = "configTab";
      }

      //Activate the tab that was clicked
      UIconfig.tabsByTitle[this.title].bodyElement.style.display = 'block';
      UIconfig.tabsByTitle[this.title].tabElement.className = "configTabSelect";
    };

    return ret;
  }
}

class Config {
  constructor(tabs) {
    this.tabs = tabs;
    this.tabsByTitle = {};
    
    //Create a tab bar (that holds all the tab buttons) and a body where tab content is displayed
    this.tabBar = this.makeTabBar();
    this.configBody = this.makeConfigBody();
    
    //Reset and then build the overall parent config window
    configWindow.innerHTML = "";
    configWindow.appendChild(this.tabBar);
    configWindow.appendChild(this.configBody);
  }

  //Returns a tab bar
  makeTabBar() {
    let ret = document.createElement('div');

    ret.className = 'tabBar';

    return ret;
  }
  
  //Returns a configBody element
  makeConfigBody() {
    let ret = document.createElement('div');

    ret.className = 'configBody';

    return ret;
  }

  //Populates the config window with all the tabs and their respective contents
  init() {
    //Iterate through each tab and 
    for (let i = 0; i < this.tabs.length; i++) {
      let t = this.tabs[i];
      this.tabBar.appendChild(t.tabElement);
      this.configBody.appendChild(t.bodyElement);

      //Index the tab by its title
      this.tabsByTitle[t.title] = t;
    }

    //Have the first tab activated by default
    this.tabs[0].bodyElement.style.display = 'block';
    this.tabs[0].tabElement.className = 'configTabSelect';

    //Build the overall parent config window
    configWindow.appendChild(this.tabBar);
    configWindow.appendChild(this.configBody);
  }

  //Run whenever the simulation is restarted in order to enforce the current configuration
  enforce() {
    for (let i = 0; i < inputObjs.length; i++) {
      inputObjs[i].enforce();
    }
  }
}

//Restart the simulation
function restartSim() {
  config = createDefaultConfig();
  brain = new NEAT(config);

  gameHandler = createHandler();
  gameHandler.init();
  UIconfig.enforce();

  window.cancelAnimationFrame();
  window.requestAnimationFrame(mainloop);
}

//Enter into the simulation - hides the main menu and displays the config window and pause button
function enterSim() {
  pause = false;
  mask.style.opacity = 0;
  menu.style.visibility = 'hidden';

  configWindow.style.visibility = "visible";
  configWindow.style.opacity = 1;

  pauseBtn.style.visibility = "visible";
  pauseBtn.style.opacity = 1;
}

//Pause the simulation - returns back to the main menu and hides the config window and pause button
function pauseSim() {
  pause = true;
  mask.style.opacity = 1;
  menu.style.visibility = 'visible';

  configWindow.style.visibility = "hidden";
  configWindow.style.opacity = 0;

  pauseBtn.style.visibility = "hidden";
  pauseBtn.style.opacity = 0;
}