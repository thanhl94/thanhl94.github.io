"use strict"

/*
 *  REACT+JSX STUFF:
 */

function Footer(props) { //username will be a parameter later
 return (
   <div id="footer">
     {props.children}
   </div>
 );
}

function Card1(props) {
  return <div className="card">
    {props.children}
	</div>;
}

function Card2back(props) {
  return <div className="card card_back card_reload">
    <img className="reload" src="assets/noun_Refresh_2310283.svg" alt="reload"></img>
    {props.children}
  </div>;
}

function Card2front(props) {
  return <div className="card card_front card_reload">
    <img className="reload" src="assets/noun_Refresh_2310283.svg" alt="reload"></img>
    {props.children}
  </div>;
}

function TranslateBox(props) {
  return <input id="japanese" placeholder={props.placeholder} value={props.phrase} readOnly></input>;
}

function AnswerBox(props) {
  return <div id="card_reveal"><input id="answerbox" value={props.phrase} readOnly></input></div>;
}

class PageMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '',
                    fid: '', // flashcard rowid
                    english: '', // user's input
                    japanese: '',
                    answer: '', // correct answers (compare with user's input)
                    mode: '',
                    placeholder: '',
                    button1Txt: '',
                    button2Txt: '',
                    flipState: '',
                    answerTxt:''}
    this.checkEnter = this.checkEnter.bind(this);
    this.check_n_update = this.check_n_update.bind(this);
    this.clear_entry = this.clear_entry.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.flipcard = this.flipcard.bind(this);
    this.getFlashcard = this.getFlashcard.bind(this);
    this.store = this.store.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this.synchronize = this.synchronize.bind(this);
    this.translate = this.translate.bind(this);
    this.synchronize();
  }

  render() {
    let flipcard_classes = "flipable " + this.state.flipState;

    return (
      <main>
        <div id="header">
          <div className="button button_blue" onClick={this.switchMode}>
            <p>{this.state.button1Txt}</p>
          </div>

          <p className="logo">Lango!</p>
        </div>

        <div id="content">
          <div className={this.state.mode}>
            <Card1>
              <input id="english" placeholder="English" onKeyPress={this.checkEnter}></input>
            </Card1>
            <div className="gap"></div>
            <div className={flipcard_classes} onClick={this.check_n_update}>
              <Card2back>
               <AnswerBox phrase={this.state.answerTxt}/>
              </Card2back>
              <Card2front>
               <TranslateBox phrase={this.state.japanese} placeholder={this.state.placeholder}/>
              </Card2front>
            </div>
          </div>

          <div className="button button_green" onClick={this.clickHandler}>
            <p>{this.state.button2Txt}</p>
          </div>
        </div>
        <Footer>
          <p id="username">{this.state.username}</p>
        </Footer>
      </main>
    );
  } // end of render function

  checkEnter(event) {
     if (event.charCode === 13){
       if (this.state.mode == 'create')
         this.translate();
       else
         this.check_n_update();
     }
  }

  check_n_update() {
    let english = document.getElementById('english');
    let correct;

    if (english.value.length == 0 || this.state.mode == 'create' || this.state.answer == '')
      return;

  	if(english.value.toLowerCase() == this.state.answer.toLowerCase()){
      this.setState({answerTxt: 'CORRECT!'});
  		correct = 1;
  	} else {
	    this.setState({answerTxt: 'INCORRECT!'});
  		correct = 0;
    }

    this.flipcard();

    if (this.state.flipState == '') { // only send update when we are flipping from front to back
      let url = 'update?fid=' + this.state.fid +'&correct=' + correct;
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.send();
    }
  }

  clear_entry() {
    let english = document.getElementById('english');
    english.value = '';
    this.setState({english: '',
                  japanese: '',
                  answer: '',
                  flipState: ''});
  }

  clickHandler() { // process green button's click depending on current mode (review/create)
    if (this.state.mode == "review")
      this.getFlashcard();
    else
      this.store();
  }

  flipcard() {
    if (this.state.flipState == 'active')
      this.setState({flipState: ''});
    else
      this.setState({flipState: 'active'});
  }

  getFlashcard() {
    this.clear_entry();
    let url = 'flashcard';

    if (this.state.fid != -1)
      url = url + '?last=' + this.state.fid;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function() {
      let responseStr = xhr.responseText;
      let object = JSON.parse(responseStr);
      console.log(object);
      if (object.fid != -1) {
        this.setState({fid: object.fid,
                        answer: object.english,
                        japanese: object.japanese});
      } else {
        this.setState({answer: '',
                        placeholder: 'You need create flashcard first!'});
      }

    }.bind(this);

    xhr.send();
  }

  store() {
    if (this.state.english.length == 0)
      return;

    let url = 'store?english=' + this.state.english + '&japanese=' + this.state.japanese;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function() {
      console.log("Flashcard Stored.");
    }

    xhr.send();
    this.clear_entry();
  }

  switchMode() {
    this.clear_entry();

    if (this.state.mode == 'review') {
      this.setState({mode: 'create',
                      placeholder: 'Translate',
                      button1Txt: 'Review!',
                      button2Txt: 'Save'});
    }
    else {
      this.setState({mode: 'review',
                      placeholder: '',
                      button1Txt: 'Add',
                      button2Txt: 'Next'});
      this.getFlashcard();
    }
  }

  synchronize() {
    let url = 'sync';
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function() {
      let responseStr = xhr.responseText;
      let object = JSON.parse(responseStr);
      console.log(object);

      if (object.returning == 0) {
        this.setState({username: object.name,
                        mode: 'create',
                        placeholder: 'Translate',
                        button1Txt: 'Review!',
                        button2Txt: 'Save'});
      }
      else {
        this.setState({username: object.name,
                        mode: 'review',
                        placeholder: '',
                        button1Txt: 'Add',
                        button2Txt: 'Next'});
        this.getFlashcard();
      }
    }.bind(this);

    xhr.send();
  }

  translate() {
    let english = document.getElementById('english');

    if (english.value.length == 0)
      return;

    let url = 'translate?english=' + english.value;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function() {
      let responseStr = xhr.responseText;
      let object = JSON.parse(responseStr);
      console.log(object);
      this.setState({english: object.English,
                      japanese: object.Japanese});
    }.bind(this);

    xhr.send();
  }
}

ReactDOM.render(
  <PageMain />,
  document.getElementById('root')
);
