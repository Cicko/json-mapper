import * as React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

interface Props {
	value: string;
	onValueChange: (value: string) => void;
}

const EditorComponent: React.FC<Props> = (props: Props) =>  {
	return 
		<Editor
    		placeholder="Type some code…"
			value={props.value}
    		onValueChange={props.onValueChange}
    		highlight={code => highlight(code, languages.json)}
    		padding={20}
    		className="container__editor"
		/>
	;
}

export default EditorComponent;
