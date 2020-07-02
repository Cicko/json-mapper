import React from 'react';
import Editor from 'react-simple-code-editor';
import dedent from 'dedent';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import privileges from './privileges';
import './index.css';

// import doesn't seem to work properly with parcel for jsx
require('prismjs/components/prism-jsx');

class App extends React.Component {
  state = {
    code: JSON.stringify(privileges, null, ' '),
    parsedCode: null,
    result: '',
    input: 'content.id',
  };

  onInputChange = (e) => {
    const val = e.target.value;
    this.setState({ input: val })

    // this.computeResult();
  };

  computeResult = () => {
    const val = this.state.input;
    let code;
    try {
      if (!this.state.parsedCode) {
        code = JSON.parse(this.state.code);
        console.log('parsed code');
      } else {
        code = this.state.parsedCode;
      }
    } catch(e) {
      console.log(e.message)
    }
    const keys = val.includes('.') ? val.split('.') : [val];
    let result = {};

    keys.forEach(key => {
      if (result.length) { // If it's an array
        result = result.map(item => item[key])
      } else {
        result = code[key]
      }
    });


    code.modified = true;


    this.setState({ result: JSON.stringify(result, null, ' '), parsedCode: code })
  };

  render() {
    return (
        <main className="container">
          <div className="container__content">
            <h1>JSON mapper</h1>
            <p>Easy way to extract the data you want from your json object.</p>
            <input value={this.state.input} onChange={this.onInputChange}/>
            <button onClick={this.computeResult}> Compute </button>
            <div className="container_wrapper">
              <div className="container_editor_area">
                <Editor
                    placeholder="Type some code…"
                    value={this.state.code}
                    onValueChange={code => {
                      this.setState({ code });
                      // this.computeResult();
                    }}
                    highlight={code => highlight(code, languages.json)}
                    padding={20}
                    className="container__editor"
                />
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
        </main>
    );
  }
}

export default App;
