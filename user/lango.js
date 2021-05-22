"use strict";

/*
 *  REACT+JSX STUFF:
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function Footer(props) {
  //username will be a parameter later
  return React.createElement(
    "div",
    { id: "footer" },
    props.children
  );
}

function Card1(props) {
  return React.createElement(
    "div",
    { className: "card" },
    props.children
  );
}

function Card2back(props) {
  return React.createElement(
    "div",
    { className: "card card_back card_reload" },
    React.createElement("img", { className: "reload", src: "assets/noun_Refresh_2310283.svg", alt: "reload" }),
    props.children
  );
}

function Card2front(props) {
  return React.createElement(
    "div",
    { className: "card card_front card_reload" },
    React.createElement("img", { className: "reload", src: "assets/noun_Refresh_2310283.svg", alt: "reload" }),
    props.children
  );
}

function TranslateBox(props) {
  return React.createElement("input", { id: "japanese", placeholder: props.placeholder, value: props.phrase, readOnly: true });
}

function AnswerBox(props) {
  return React.createElement(
    "div",
    { id: "card_reveal" },
    React.createElement("input", { id: "answerbox", value: props.phrase, readOnly: true })
  );
}

var PageMain = function (_React$Component) {
  _inherits(PageMain, _React$Component);

  function PageMain(props) {
    _classCallCheck(this, PageMain);

    var _this = _possibleConstructorReturn(this, (PageMain.__proto__ || Object.getPrototypeOf(PageMain)).call(this, props));

    _this.state = { username: '',
      fid: '', // flashcard rowid
      english: '', // user's input
      japanese: '',
      answer: '', // correct answers (compare with user's input)
      mode: '',
      placeholder: '',
      button1Txt: '',
      button2Txt: '',
      flipState: '',
      answerTxt: '' };
    _this.checkEnter = _this.checkEnter.bind(_this);
    _this.check_n_update = _this.check_n_update.bind(_this);
    _this.clear_entry = _this.clear_entry.bind(_this);
    _this.clickHandler = _this.clickHandler.bind(_this);
    _this.flipcard = _this.flipcard.bind(_this);
    _this.getFlashcard = _this.getFlashcard.bind(_this);
    _this.store = _this.store.bind(_this);
    _this.switchMode = _this.switchMode.bind(_this);
    _this.synchronize = _this.synchronize.bind(_this);
    _this.translate = _this.translate.bind(_this);
    _this.synchronize();
    return _this;
  }

  _createClass(PageMain, [{
    key: "render",
    value: function render() {
      var flipcard_classes = "flipable " + this.state.flipState;

      return React.createElement(
        "main",
        null,
        React.createElement(
          "div",
          { id: "header" },
          React.createElement(
            "div",
            { className: "button button_blue", onClick: this.switchMode },
            React.createElement(
              "p",
              null,
              this.state.button1Txt
            )
          ),
          React.createElement(
            "p",
            { className: "logo" },
            "Lango!"
          )
        ),
        React.createElement(
          "div",
          { id: "content" },
          React.createElement(
            "div",
            { className: this.state.mode },
            React.createElement(
              Card1,
              null,
              React.createElement("input", { id: "english", placeholder: "English", onKeyPress: this.checkEnter })
            ),
            React.createElement("div", { className: "gap" }),
            React.createElement(
              "div",
              { className: flipcard_classes, onClick: this.check_n_update },
              React.createElement(
                Card2back,
                null,
                React.createElement(AnswerBox, { phrase: this.state.answerTxt })
              ),
              React.createElement(
                Card2front,
                null,
                React.createElement(TranslateBox, { phrase: this.state.japanese, placeholder: this.state.placeholder })
              )
            )
          ),
          React.createElement(
            "div",
            { className: "button button_green", onClick: this.clickHandler },
            React.createElement(
              "p",
              null,
              this.state.button2Txt
            )
          )
        ),
        React.createElement(
          Footer,
          null,
          React.createElement(
            "p",
            { id: "username" },
            this.state.username
          )
        )
      );
    } // end of render function

  }, {
    key: "checkEnter",
    value: function checkEnter(event) {
      if (event.charCode === 13) {
        if (this.state.mode == 'create') this.translate();else this.check_n_update();
      }
    }
  }, {
    key: "check_n_update",
    value: function check_n_update() {
      var english = document.getElementById('english');
      var correct = void 0;

      if (english.value.length == 0 || this.state.mode == 'create' || this.state.answer == '') return;

      if (english.value.toLowerCase() == this.state.answer.toLowerCase()) {
        this.setState({ answerTxt: 'CORRECT!' });
        correct = 1;
      } else {
        this.setState({ answerTxt: 'INCORRECT!' });
        correct = 0;
      }

      this.flipcard();

      var url = 'update?fid=' + this.state.fid + '&correct=' + correct;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.send();
    }
  }, {
    key: "clear_entry",
    value: function clear_entry() {
      var english = document.getElementById('english');
      english.value = '';
      this.setState({ english: '',
        japanese: '',
        answer: '',
        flipState: '' });
    }
  }, {
    key: "clickHandler",
    value: function clickHandler() {
      // process green button's click depending on current mode (review/create)
      if (this.state.mode == "review") this.getFlashcard();else this.store();
    }
  }, {
    key: "flipcard",
    value: function flipcard() {
      if (this.state.flipState == 'active') this.setState({ flipState: '' });else this.setState({ flipState: 'active' });
    }
  }, {
    key: "getFlashcard",
    value: function getFlashcard() {
      this.clear_entry();
      var url = 'flashcard';

      if (this.state.fid != -1) url = url + '?last=' + this.state.fid;

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);

      xhr.onload = function () {
        var responseStr = xhr.responseText;
        var object = JSON.parse(responseStr);
        console.log(object);
        if (object.fid != -1) {
          this.setState({ fid: object.fid,
            answer: object.english,
            japanese: object.japanese });
        } else {
          this.setState({ answer: '',
            placeholder: 'You need create flashcard first!' });
        }
      }.bind(this);

      xhr.send();
    }
  }, {
    key: "store",
    value: function store() {
      if (this.state.english.length == 0) return;

      var url = 'store?english=' + this.state.english + '&japanese=' + this.state.japanese;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);

      xhr.onload = function () {
        console.log("Flashcard Stored.");
      };

      xhr.send();
      this.clear_entry();
    }
  }, {
    key: "switchMode",
    value: function switchMode() {
      this.clear_entry();

      if (this.state.mode == 'review') {
        this.setState({ mode: 'create',
          placeholder: 'Translate',
          button1Txt: 'Review!',
          button2Txt: 'Save' });
      } else {
        this.setState({ mode: 'review',
          placeholder: '',
          button1Txt: 'Add',
          button2Txt: 'Next' });
        this.getFlashcard();
      }
    }
  }, {
    key: "synchronize",
    value: function synchronize() {
      var url = 'sync';
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);

      xhr.onload = function () {
        var responseStr = xhr.responseText;
        var object = JSON.parse(responseStr);
        console.log(object);

        if (object.returning == 0) {
          this.setState({ username: object.name,
            mode: 'create',
            placeholder: 'Translate',
            button1Txt: 'Review!',
            button2Txt: 'Save' });
        } else {
          this.setState({ username: object.name,
            mode: 'review',
            placeholder: '',
            button1Txt: 'Add',
            button2Txt: 'Next' });
          this.getFlashcard();
        }
      }.bind(this);

      xhr.send();
    }
  }, {
    key: "translate",
    value: function translate() {
      var english = document.getElementById('english');

      if (english.value.length == 0) return;

      var url = 'translate?english=' + english.value;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);

      xhr.onload = function () {
        var responseStr = xhr.responseText;
        var object = JSON.parse(responseStr);
        console.log(object);
        this.setState({ english: object.English,
          japanese: object.Japanese });
      }.bind(this);

      xhr.send();
    }
  }]);

  return PageMain;
}(React.Component);

ReactDOM.render(React.createElement(PageMain, null), document.getElementById('root'));