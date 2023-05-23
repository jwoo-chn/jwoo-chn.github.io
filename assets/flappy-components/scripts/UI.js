// initiallizes all elements needed 
const mask = document.getElementById('mask');
const menu = document.getElementById('mainMenu');
const editWindow = document.getElementById("configWindow");
const pauseBtn = document.getElementById("pauseBtn");
const configWindow = document.getElementById("configWindow");
const configWindowContainer = document.getElementById("configWindowContainer");

var UIconfig; // initialized when document loads, so starts empty
var inputObjs = []; //a maintained list of all the input objects for easy access

// parent class of all input elements
class Input {
  // all inputs share in common a title and a description
  constructor(title, desc) {
    this.title = title;
    this.desc = desc;

    // add this object to the list of all input objects
    inputObjs.push(this);
  }
}

// represents a range slider, which not only forces the input to be a number but also gives an easy way for users to change simulation properties
class Slider extends Input {
  constructor(control, title, desc, range, init) {
    super(title, desc);

    this.range = range; // represents the inclusive range [l, r]
    this.init = init; // initial value

    this.control = control; // the attribute which is being controlled

    // each of these will eventually store HTML elements relevant to the slider.
    this.inputElement, this.titleElement, this.descElement, this.valueElement;

    // this.element represents the actual slider HTML element itself.
    this.element = this.makeElement();
  }

  // returns an HTML div that houses the title, description, and range slider
  makeElement() {
    // the variable to be returned
    let ret = document.createElement('div');
    
    ret.className = 'configInputWrapper';

    // leftSide and rightSide represent the left and right sides of the input element.
    // the left side houses the title and description while the right side houses the actual range slider.
    let leftSide = document.createElement('div');
    let rightSide = document.createElement('div');

    // create the title and description elements
    this.titleElement = document.createElement('div');
    this.descElement = document.createElement('div');

    this.titleElement.innerHTML = this.title + ': ';
    this.titleElement.className = 'configPropertyTitle';
    this.descElement.innerHTML = this.desc;
    this.descElement.className = 'configPropertyDesc';
    
    // applies specific css to objects
    leftSide.style.width = '50%';
    leftSide.className = 'rightSideBorder';
    rightSide.style.width = '50%';
    rightSide.style.padding = '1rem 1.5rem .8rem 1rem';

    // adds the element to the leftSide div
    leftSide.appendChild(this.titleElement);
    leftSide.appendChild(this.descElement);

    // this.valueElement simply holds the current value of the slider
    this.valueElement = document.createElement('span');
    this.valueElement.style.color = 'rgb(0,200,255)';

    // sets string to the displayed-text for the slider, when it is changed
    let outputVal = this.init;

    // if it is the mutation rate, add percent sign
    if (this.control == "mutationRate")
      outputVal += "%";
    
    // set the output text to the slider's text
    this.valueElement.innerHTML = outputVal;
    
    // add the element
    this.titleElement.appendChild(this.valueElement);

    // create the actual slider element
    let inp = document.createElement("input");
    inp.type = "range";
    inp.min = this.range[0];
    inp.max = this.range[1];
    inp.value = this.init;
    inp.className = "configSlider";

    // when the slider element is interacted with, call the .oninput() function
    inp.oninput = () => {
      this.oninput();
    }

    this.inputElement = inp;

    // build the div hierarchy
    rightSide.appendChild(inp);
    ret.appendChild(leftSide);
    ret.appendChild(rightSide);

    // return the div containing the slider
    return ret;
  }

  // run whenever the slider element is interacted with and its value has changed
  oninput() {
    // for most sliders, simply update a given property (this.control) with the current slider value
    gameHandler[this.control] = Number(this.inputElement.value);

    let outputVal = this.inputElement.value;

    // the following if/else statements handle edge cases where more things need to be modified
    if(this.control == "numBirds"){
      // gets the number of birds from the slider
      let numBirds = Number(this.inputElement.value);
      
      // if no change in the numBirds in the UI, no need to restart simulation
      if (numBirds == config.populationSize)
        return;
      
      // set the config to match the new change  
      config.populationSize = numBirds;

      // creates new brain with new config
      brain = new NEAT(config);
      
      // create new default gameHandler for fresh set of birds
      gameHandler = createHandler();

      // applies the change with the new number of birds from slider
      gameHandler.numBirds = numBirds;

      // applies all other previous configuration settings to restarted simulation
      UIconfig.enforce();
      
      // reinitialize handler to restart the simulation 
      gameHandler.init();
      
    } else if(this.control == "mutationRate"){
      // gets the mutationRate from the slider
      let mutationRate = Number(this.inputElement.value)/100;

      // if no change in the mutation rate in the slider, no need to restart simulation
      if (mutationRate == config.mutationRate)
        return;

      // set the config to match the new change  
      config.mutationRate = mutationRate;

       // creates new brain with new config
      brain = new NEAT(config);
      
      // create new default gameHandler for fresh set of birds
      gameHandler = createHandler();
      
      // applies the change with the mutationRate from the slider
      gameHandler.mutationRate = mutationRate;

      // applies all other previous configuration settings to restarted simulation
      UIconfig.enforce();
      
      // reinitialize handler to restart the simulation
      gameHandler.init();
    
      // adds percent sign to the output text, as it is the mutation rate percentage
      outputVal += "%";
    }

    // update the displayed value with the output text
    this.valueElement.innerHTML = outputVal;
  }

  // enforces the current input values whenever the simulation restarts
  enforce() {
    this.oninput();
  }
}

class Graph {
  constructor(title) {
    this.title = title;
    this.generations = [];
    this.scores = [];
    this.element = this.makeElement(); // the actual button element
  }

  makeElement() {
    let ret = document.createElement('div');

    ret.className = 'configInputWrapper centerChildren';

    let c = document.createElement('div');
    
    c.id = "chartContainer";

    // leftSide and rightSide represent the left and right sides of the input element.
    // the left side houses the actual button while the right side houses the button description.
    let leftSide = document.createElement('div');
    let rightSide = document.createElement('div');

    // create the description element
    this.descElement = document.createElement('div');
    this.descElement.innerHTML = this.desc;
    this.descElement.className = 'configPropertyDesc';

    // styling the left and right side divs
    leftSide.style.width = '30%';
    rightSide.style.width = '60%';
    rightSide.style.padding = '.5rem .6rem';

    // build the div hierarchy
    c.appendChild(leftSide);
    c.appendChild(rightSide);

    ret.appendChild(c);
    return ret;
  }

  drawGraph(generation, score) {
    this.generations.push(generation);
    this.scores.push(score);
    var data = [
      {
        x: this.generations,
        y: this.scores,
        type: 'scatter',
        mode: 'lines'
      }
    ];
    var layout = {
      autosize: false,
      width: 400,
      height: 400,
      margin: {
        l: 50,
        r: 50,
        b: 100,
        t: 100,
        pad: 4
      },
      title: {
        text: this.title,
        font: {
          size: 24
        }
      },
      yaxis: {
        title: 'Scores',
        tickmode: 'array',
        automargin: true,
      },
      xaxis: {
        title: 'Generations',
        tickmode: 'array',
        automargin: true,
      },
      font: {
        color: 'rgb(235,235,235)'
      },
      paper_bgcolor: 'rgb(30,30,30)',
      plot_bgcolor: '#c7c7c7'
    };
    
    var config = {responsive: true, displayModeBar: false, staticPlot: true}

    Plotly.newPlot('chartContainer', data, layout, config);
  }
}

class Button extends Input {
  constructor(callback, title, desc) {
    super(title, desc);

    this.callback = callback; // callback is called whenever the button is clicked

    // will be set to the element that represents the description of the button
    this.descElement;

    this.element = this.makeElement(); // the actual button element
  }

  // returns an HTML div that houses the description and button
  makeElement() {
    // the variable to be returned
    let ret = document.createElement('div');
    
    ret.className = 'configInputWrapper';

    // leftSide and rightSide represent the left and right sides of the input element.
    // the left side houses the actual button while the right side houses the button description.
    let leftSide = document.createElement('div');
    let rightSide = document.createElement('div');

    // create the description element
    this.descElement = document.createElement('div');
    this.descElement.innerHTML = this.desc;
    this.descElement.className = 'configPropertyDesc';

    // styling the left and right side divs
    leftSide.style.width = '30%';
    rightSide.style.width = '60%';
    rightSide.style.padding = '.5rem .6rem';

    // create the button element
    let bt = document.createElement('button');

    bt.className = "configButton";
    bt.innerHTML = this.title;

    // when the button is clicked, call this.onclick();
    bt.onclick = () => {
      this.onclick();
    }

    // build the div hierarchy
    rightSide.appendChild(this.descElement);
    leftSide.appendChild(bt);
    ret.appendChild(leftSide);
    ret.appendChild(rightSide);

    return ret;
  }

  // run whenever the button is clicked
  onclick() {
    // execute the specified callback 
    this.callback();
  }

  // enforces the current input values whenever the simulation restarts
  // in the case of a button, nothing needs to be done - this function only exists for consistency between Input classes
  enforce() {
    
  }
}

class ConfigTab {
  constructor(title, inputs) {
    this.title = title;
    this.inputs = inputs; // contains a list of input elements

    this.bodyElement = this.makeBodyElement(); // this.bodyElement represents the content of a tab
    this.tabElement = this.makeTabElement(); // this.tabElement represents the tab button
  }
  makeBodyElement() {
    // the variable to be returned
    let ret = document.createElement('div');

    ret.className = "configTabBody";

    // iterate through all the inputs that should be added into the tab body
    for (let i = 0; i < this.inputs.length; i++) {
      ret.appendChild(this.inputs[i].element);
    }

    // set the body to be hidden by default
    ret.style.display = 'none';

    return ret;
  }
  makeTabElement() {
    // the variable to be returned
    let ret = document.createElement('button');

    ret.className = "configTab";
    ret.innerHTML = this.title;

    // when the tab button is clicked, switch to that tab
    ret.onclick = () => {
      // iterate through each tab and deactivate all of them
      for (let t in UIconfig.tabsByTitle) {
        UIconfig.tabsByTitle[t].bodyElement.style.display = 'none';
        UIconfig.tabsByTitle[t].tabElement.className = "configTab";
      }

      // activate the tab that was clicked
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
    
    // create a tab bar (that holds all the tab buttons) and a body where tab content is displayed
    this.tabBar = this.makeTabBar();
    this.configBody = this.makeConfigBody();
    
    // reset and then build the overall parent config window
    configWindow.innerHTML = "";
    configWindow.appendChild(this.tabBar);
    configWindow.appendChild(this.configBody);
  }

  // returns a tab bar
  makeTabBar() {
    let ret = document.createElement('div');

    ret.className = 'tabBar';

    return ret;
  }
  
  // returns a configBody element
  makeConfigBody() {
    let ret = document.createElement('div');

    ret.className = 'configBody';

    return ret;
  }

  // populates the config window with all the tabs and their respective contents
  init() {
    // iterate through each tab
    for (let i = 0; i < this.tabs.length; i++) {
      let t = this.tabs[i];
      this.tabBar.appendChild(t.tabElement);
      this.configBody.appendChild(t.bodyElement);

      // index the tab by its title
      this.tabsByTitle[t.title] = t;
    }

    // have the first tab activated by default
    this.tabs[0].bodyElement.style.display = 'block';
    this.tabs[0].tabElement.className = 'configTabSelect';

    // build the overall parent config window
    configWindow.appendChild(this.tabBar);
    configWindow.appendChild(this.configBody);
  }

  // run whenever the simulation is restarted in order to enforce the current configuration
  enforce() {
    for (let i = 0; i < inputObjs.length; i++) {
      inputObjs[i].enforce();
    }
  }
}

// restart the simulation
function restartSim() {
  location.reload();
}

// enter into the simulation - hides the main menu and displays the config window and pause button
function enterSim() {
  pause = false;
  mask.style.opacity = 0;
  menu.style.visibility = 'hidden';

  configWindowContainer.style.visibility = "visible";
  configWindowContainer.style.opacity = 1;

  pauseBtn.style.visibility = "visible";
  pauseBtn.style.opacity = 1;
}

// pause the simulation - returns back to the main menu and hides the config window and pause button
function pauseSim() {
  pause = true;
  mask.style.opacity = 1;
  menu.style.visibility = 'visible';

  configWindowContainer.style.visibility = "hidden";
  configWindowContainer.style.opacity = 0;

  pauseBtn.style.visibility = "hidden";
  pauseBtn.style.opacity = 0;
}