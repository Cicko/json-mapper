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
    url: '',
    result: '',
    path: [],
    errorMessage: '',
    warningMessage: '',
  };

  componentDidMount() {
    this.computeResult();
  }

  onInputChange = async (e: ChangeEvent<HTMLInputElement>, compute: boolean) => {
    const val = e.target.value;
    await this.setState({ input: val, path: [val] })
    if (compute) {
      this.computeResult()
    }
  };

  computeResult = async () => {
    let warningMessage = null;
    let errorMessage = null;

    let code: TResult = this.state.jsonCode;
    let result: TResult = {};

    this.state.path.forEach((key: string) => {
      try {
        if (Object.keys(result).length === 0 && code[key]) {
            result = code[key];
        } else if (result.length && typeof result !== 'string') { // If it's an array
          result = result.map(item => {
            return item[key]
          });
        } else if (result[key]) {
          result = result[key];
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


    await this.setState({
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

  renderSubKeys = () => {
    let acc = this.state.jsonCode
    return this.state.path.map((key, index, arr) => {
      acc = acc[key]
      const parsed = acc
      let subKeys = parsed && typeof parsed[0] !== 'string'
          ? typeof parsed[0] !== 'object' ? Object.keys(parsed) : Object.keys(parsed[0])
          : null
      if (subKeys) {
        return <select onChange={async (e) => {
          const val = e.target.value;
          await this.setState({
            path: index < arr.length - 1 ? [...arr.slice(0, index + 1), val] : [...this.state.path, val]
          })
          console.log(this.state.path)
          await this.computeResult()
        }}>
          <option value={null}> </option>
          {subKeys.map(key => <option value={key}>{key}</option>)}
        </select>
      }
    })
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
            <h1>JSON Extractor</h1>
            <p>Easy way to extract the data you want from your json object.</p>
            <select onChange={(e) => {
              this.onInputChange(e, true)
            }}>
              {Object.keys(this.state.jsonCode).map(key => <option value={key}>{key}</option>)}
            </select>
            {this.state.result && this.renderSubKeys()}
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
                <label>URL </label>
                <input onChange={(e) => {
                  const val = e.target.value
                  this.setState({ url: val })
                }}></input>
                {' '}<button onClick={async () => {
                try {
                  console.log(this.state.url)
                  const res = await fetch(this.state.url, {
                    mode: 'no-cors',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  })
                  console.log(res)
                  const json = await res.json()
                  console.log(json)
                } catch(e) {
                  console.log('bro error')
                  console.error(e)
                }

              }}>Fetch</button>
                {this.renderInputByMode()}
              </div>
              <div className="container_editor_area">
                <h2>Result</h2>
                <Editor
                    placeholder="Result will be here…"
                    value={this.state.result}
                    highlight={code => highlight(code, languages.json)}
                    onValueChange={() => {}}
                    padding={20}
                    className="container__editor"
                />
              </div>
            </div>
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
          <div className="container__footer" style={{ position: "absolute", bottom: 0, margin: 20 }}>
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
              &nbsp;by&nbsp;Rudolf Cicko&nbsp;©&nbsp;2023</a>
            </div>
            </footer>
          </div>
        </main>
    );
  }
}

export default App;
