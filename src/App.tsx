// @ts-nocheck
import React, {AnchorHTMLAttributes, ChangeEvent, ChangeEventHandler} from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import { FaHeart, FaDownload } from 'react-icons/fa';
import JSONTree from 'react-json-tree'
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import sampleInput from './data/example.json';
import './index.css';

// import doesn't seem to work properly with parcel for jsx
require('prismjs/components/prism-jsx');

type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

interface JSONArray extends Array<JSONValue> { }

interface JSONObject {
  [x: string]: JSONValue;
}

type TResult = JSONValue | JSONObject

class App extends React.Component {
  state = {
    stringifiedCode: JSON.stringify(sampleInput, null, '\t'),
    jsonCode: sampleInput,
    viewMode: 'edit',
    result: '',
    input: 'pets.type',
    errorMessage: '',
    warningMessage: '',
  };

  componentDidMount() {
    this.computeResult();
  }

  onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    this.setState({ input: val })
  };

  computeResult = () => {
    const filter = this.state.input;
    let warningMessage = null;
    let errorMessage = null;

    let code: TResult = this.state.jsonCode;
    const path: string[] = filter.includes('.') ? filter.split('.') : [filter];
    let result: TResult = {};

    path.forEach((key: string) => {
      try {
        if (Object.keys(result).length === 0 && code[key]) {
            result = code[key];
        } else if (result.length && typeof result !== 'string') { // If it's an array
          result = result.map(item => {
            if (!item[key]) {
              warningMessage = `'${key}' key inside ${JSON.stringify(item)} doesn't exist`;
              return item;
            }
            return item[key]
          });
        } else if (result[key]) {
          result = result[key];
        } else {
          warningMessage = `'${key}' key doesn't exist`;
          if (key.includes("\"")) {
            warningMessage += '. Try remove the " symbols.'
          }
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
      result: JSON.stringify(result, null, '\t'), 
      parsedInput: code, 
      warningMessage,
      errorMessage,
    })
  };

  renderEditMode = () => {
    return <Editor
    placeholder="Type some code bro"
    value={this.state.stringifiedCode}
    onValueChange={stringifiedCode => {
      this.setState({ stringifiedCode });
      this.setState({ jsonCode: JSON.parse(stringifiedCode)})
    }}
    highlight={code => highlight(code, languages.json)}
    padding={20}
    className="container__editor"
/>
  }

  renderTreeMode = () => {
    return <JSONTree data={this.state.jsonCode} />;
  }

  renderInputByMode = () => {
    switch(this.state.viewMode) {
      case 'edit': return this.renderEditMode();
      case 'tree': return this.renderTreeMode();
      default: return null;
    }
  }

  renderInviteMeACoffee = () => 
    <a href="https://www.buymeacoffee.com/rudolfcicko" target="_blank">
      <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" 
        style={{ height: 33, width: 139}}/>
    </a>

  render() {
    return (
        <main className="container">
          <div className="container__content">
            <h1>JSON Mapper</h1>
            <p>Easy way to extract the data you want from your json object.</p>
            <input value={this.state.input} onChange={this.onInputChange} onKeyDown={(e) => {
              if (e.keyCode === 13) {
                this.computeResult();
              }
            }}/>
            <button onClick={this.computeResult}> Generate result </button>
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
                {/*
                <div className="container_editor_tools">
                  <FaEdit style={{ color: '#9e9e9e' }} title="edit view" onClick={() => this.setState({ viewMode: 'edit'})}/>
                  <FaTree style={{ color: '#9e9e9e' }} title="tree view" onClick={() => this.setState({ viewMode: 'tree'})}/>
                </div>
                */}
                {this.renderInputByMode()}
              </div>
              <div className="container_editor_area">
                <Editor
                    placeholder="Result will be here…"
                    value={this.state.result}
                    highlight={code => highlight(code, languages.json)}
                    onValueChange={() => {}}
                    padding={20}
                    className="container__editor"
                />
                {this.state.result && <div className="container_result_tools">
                  <FaDownload title="Download result in json file" onClick={() => {
                    const anchor = document.createElement('a');
                    anchor.href = `data:application/json;charset=utf-8;base64,${btoa(this.state.result)}`
                    anchor.download = 'result.json'
                    document.body.appendChild(anchor);
                    anchor.click()
                    document.body.removeChild(anchor);
                  }}/>
                </div>}
              </div>
            </div>
          </div>
          <div className="container__footer">
            <div className="footer_first-phrase">
              <p>
                Let me know if you like this tool to continue working on it.&nbsp; 
                <a href="https://github.com/cicko/json-mapper/pulls" target="_blank">
                  Collaborate
                </a>  
                &nbsp;or&nbsp;
                <a href="https://github.com/Cicko/json-mapper" target="_blank">
                  give me a ⭐ :) 
                </a>
              </p>
            </div>
            <footer>
            <div className="footer__copyright">
            <a target="_blank" href="https://github.com/Cicko">
              Created with&nbsp;
              <FaHeart style={{ color: '#DB4437'}} />
              &nbsp;by&nbsp;Rudolf Cicko&nbsp;©&nbsp;2020</a>
            </div>
            </footer>
          </div>
        </main>
    );
  }
}

export default App;
