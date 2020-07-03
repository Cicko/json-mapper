import React from 'react';
import Editor from 'react-simple-code-editor';
import dedent from 'dedent';
import { highlight, languages } from 'prismjs/components/prism-core';
import { SocialIcon } from 'react-social-icons';
import { FaTree, FaHeart, FaCopyright, FaEdit, FaStar, FaCoffee } from 'react-icons/fa';
import JSONTree from 'react-json-tree'
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import sampleInput from './data/example';
import './index.css';

// import doesn't seem to work properly with parcel for jsx
require('prismjs/components/prism-jsx');


class App extends React.Component {
  state = {
    code: JSON.stringify(sampleInput, null, '\t'),
    parsedInput: sampleInput,
    viewMode: 'edit',
    result: '',
    input: 'pets.type',
    errorMessage: '',
    warningMessage: '',
  };

  onInputChange = (e) => {
    const val = e.target.value;
    this.setState({ input: val })

    // this.computeResult();
  };

  computeResult = () => {
    const val = this.state.input;
    let warningMessage = null;
    let errorMessage = null;
    let code;
    try {
      if (!this.state.parsedCode) {
        code = JSON.parse(this.state.code);
      } else {
        code = this.state.parsedCode;
      }
    } catch(e) {
      errorMessage = `Error in the Input: ${e.message}`
    }
    const keys = val.includes('.') ? val.split('.') : [val];
    let result = null;

    keys.forEach(key => {
      try {
        if (!result && code[key]) {
          result = code[key];
        } else if (result.length && typeof result !== 'string') { // If it's an array
          result = result.map(item => {
            if (!item[key]) {
              warningMessage = `'${key}' key inside ${JSON.stringify(item)} doesn't exist`;
            }
            return item[key]
          });
        } else if (result[key]) {
          result = result[key];
        } else {
          warningMessage = `'${key}' key inside ${JSON.stringify(result)} doesn't exist`;
        }
      } catch(e) {
        if (e.message === 'Cannot read property \'length\' of null') {
          errorMessage = `'${key}' key doesn't exist`;
          result = null;
        }
      }
    });

    if (!result) {
      result = {};
    }


    // code.modified = true;


    this.setState({ 
      result: JSON.stringify(result, null, ' '), 
      parsedInput: code, 
      warningMessage,
      errorMessage,
    })
  };

  renderEditMode = () => {
    return <Editor
    placeholder="Type some code…"
    value={this.state.code}
    onValueChange={code => {
      this.setState({ code });
    }}
    highlight={code => highlight(code, languages.json)}
    padding={20}
    className="container__editor"
/>
  }

  renderTreeMode = () => {
    return <JSONTree data={this.state.parsedInput} />;
  }

  renderInputByMode = () => {
    switch(this.state.viewMode) {
      case 'edit': return this.renderEditMode();
      case 'tree': return this.renderTreeMode();
      default: return null;
    }
  }

  renderInviteMeACoffee = () => <div className="invite-coffee"><a target="_blank" href="https://paypal.me/rudolfcicko">Invite me a coffee :) </a></div> 

  render() {
    return (
        <main className="container">
          {this.renderInviteMeACoffee()}
          <div className="container__content">
            <h1>JSON Mapper</h1>
            <p>Easy way to extract the data you want from your json object.</p>
            <input value={this.state.input} onChange={this.onInputChange}/>
            <button onClick={this.computeResult}> Compute </button>
            {this.state.errorMessage &&
              <div className="error">
                {this.state.errorMessage}
              </div>
            }
            {this.state.warningMessage &&
              <div className="warning">
                {this.state.warningMessage}
              </div>
            }
            <div className="container_wrapper">
              <div className="container_editor_area">
                <div className="container_editor_tools">
                  <FaEdit title="edit view" onClick={() => this.setState({ viewMode: 'edit'})}/>
                  <FaTree title="tree view" onClick={() => this.setState({ viewMode: 'tree'})}/>
                </div>
                {this.renderInputByMode()}
              </div>
              <div className="container_editor_area">
                <Editor
                    placeholder="Result will be here…"
                    value={this.state.result}
                    highlight={code => highlight(code, languages.json)}
                    padding={20}
                    className="container__editor"
                />
              </div>
            </div>
          </div>
          <div className="container__footer">
            <p>
              Let me know if you like this tool to continue working on it. Collaborate or <a href="https://github.com/Cicko/json-mapper" target="_blank">give me a <FaStar style={{ color: '#F4B400' }}/> :) </a>
            </p>
            <footer>
            <p>
              Created with   &nbsp;<FaHeart style={{ color: '#DB4437'}} />   &nbsp; by &nbsp;<a target="_blank" href="https://github.com/Cicko">Rudolf Cicko</a> &nbsp; © &nbsp; 2020
            </p>
            </footer>
          </div>
        </main>
    );
  }
}

export default App;
