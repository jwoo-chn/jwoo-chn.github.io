class Input {
    constructor(title, desc) {
      this.title = title;
      this.desc = desc;
    }
  }
  
  class Slider extends Input {
    constructor(control, title, desc, range, init) {
      super(title, desc);
  
      this.range = range; //represents the inclusive range [l, r]
      this.init = init; //initial value
  
      this.control = control; //the attribute which is being controlled
  
      this.inputElement, this.titleElement, this.descElement, this.valueElement;
      this.element = this.makeElement();
      inputObjs.push(this);
    }
    makeElement() {
      let ret = document.createElement('div');
      
      ret.className = 'configInputWrapper';
  
      let leftSide = document.createElement('div');
      let rightSide = document.createElement('div');
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
  
      this.valueElement = document.createElement('span');
      this.valueElement.style.color = 'rgb(0,200,255)';
      this.valueElement.innerHTML = this.init;
  
      this.titleElement.appendChild(this.valueElement);
  
      let inp = document.createElement("input");
      inp.type = "range";
      inp.min = this.range[0];
      inp.max = this.range[1];
      inp.value = this.init;
  
      inp.className = "configSlider";
  
      inp.oninput = () => {
        this.oninput();
      }
  
      this.inputElement = inp;
  
      rightSide.appendChild(inp);
      ret.appendChild(leftSide);
      ret.appendChild(rightSide);
  
      return ret;
    }
    oninput() {
      gameHandler[this.control] = Number(this.inputElement.value);
      this.valueElement.innerHTML = this.inputElement.value;
    }
    enforce() {
      this.oninput();
    }
  }
  
  class Button extends Input {
    constructor(callback, title, desc) {
      super(title, desc);
  
      this.callback = callback;
  
      this.descElement;
      this.element = this.makeElement();
      inputObjs.push(this);
    }
    makeElement() {
      let ret = document.createElement('div');
      
      ret.className = 'configInputWrapper';
  
      let leftSide = document.createElement('div');
      let rightSide = document.createElement('div');
      this.descElement = document.createElement('div');
      
      this.descElement.innerHTML = this.desc;
      this.descElement.className = 'configPropertyDesc';
  
      leftSide.style.width = '30%';
      rightSide.style.width = '60%';
      rightSide.style.padding = '.5rem .6rem';
  
      let bt = document.createElement('button');
  
      bt.className = "configButton";
      bt.innerHTML = this.title;
  
      bt.onclick = () => {
        location.reload();
      }
  
      rightSide.appendChild(this.descElement);
      leftSide.appendChild(bt);
      ret.appendChild(leftSide);
      ret.appendChild(rightSide);
  
      return ret;
    }
    onclick() {
      this.callback();
    }
    enforce() {
      //do nothing
    }
  }
  
  class ConfigTab {
    constructor(title, inputs) {
      this.title = title;
      this.inputs = inputs;
  
      this.bodyElement = this.makeBodyElement();
      this.tabElement = this.makeTabElement();
    }
    makeBodyElement() {
      let ret = document.createElement('div');
  
      ret.className = "configTabBody";
  
      for (let i = 0; i < this.inputs.length; i++) {
        ret.appendChild(this.inputs[i].element);
      }
  
      ret.style.display = 'none';
  
      return ret;
    }
    makeTabElement() {
      let ret = document.createElement('button');
  
      ret.className = "configTab";
      ret.innerHTML = this.title;
  
      ret.onclick = () => {
        console.log(this);
        for (let t in UIconfig.tabsByTitle) {
          UIconfig.tabsByTitle[t].bodyElement.style.display = 'none';
          UIconfig.tabsByTitle[t].tabElement.className = "configTab";
        }
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
      
      this.tabBar = this.makeTabBar();
      this.configBody = this.makeConfigBody();
      
      configWindow.innerHTML = "";
      configWindow.appendChild(this.tabBar);
      configWindow.appendChild(this.configBody);
    }
    makeTabBar() {
      let ret = document.createElement('div');
  
      ret.className = 'tabBar';
  
      return ret;
    }
    makeConfigBody() {
      let ret = document.createElement('div');
  
      ret.className = 'configBody';
  
      return ret;
    }
    init() {
      //generates configuration settings UI
      
      for (let i = 0; i < this.tabs.length; i++) {
        let t = this.tabs[i];
        this.tabBar.appendChild(t.tabElement);
        this.configBody.appendChild(t.bodyElement);
  
        this.tabsByTitle[t.title] = t;
      }
      this.tabs[0].bodyElement.style.display = 'block';
      this.tabs[0].tabElement.className = 'configTabSelect';
  
      configWindow.appendChild(this.tabBar);
      configWindow.appendChild(this.configBody);
    }
    enforce() {
      //run whenever the simulation is restarted in order to enforce the current configuration
      for (let i = 0; i < inputObjs.length; i++) {
        inputObjs[i].enforce();
      }
    }
  }
  
  let configWindow = document.getElementById("configWindow");
  
  let inputObjs = [];
  let UIconfig = new Config([
    new ConfigTab("Simulation", [
      new Slider('learnrate', 'Learning rate', "I don't think this is actually a thing", [2,50], 10),
      
      new Button(function() { console.log('click')}, 'Restart Simulation', 'Clear all training data and restart the simulation.'),
    ]),
    new ConfigTab("Environment", [
      new Slider('gravity', 'Gravity', 'The acceleration of gravity.', [50,100], 60),
      new Slider('pipeGapHeight', 'Pipe Gap Height', 'The distance between the top and bottom pipes.', [5,20], 10),
      
    ]),
    new ConfigTab("Miscellaneous", [
      new Slider('xVel', 'X-Velocity', 'The speed at which the birds move.', [3,30], 10),
      new Slider('jumpDist', 'Jump Power', 'The power put into a single bird flap.', [10,50], 30),
      new Slider('camX', 'Camera X', 'The horizontal position of the birds on the screen.', [2,50], 10),
    ]),
  ]);
  
  UIconfig.init();