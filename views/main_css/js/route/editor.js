"use strict";

function do_insert_data(name, data, monaco_name) {
    if(!document.getElementById(monaco_name)) {
        // https://stackoverflow.com/questions/11076975/insert-text-into-textarea-at-cursor-position-javascript
        if(document.selection) {
            document.getElementById(name).focus();

            let sel = document.selection.createRange();
            sel.text = data;
        } else if(
            document.getElementById(name).selectionStart || 
            document.getElementById(name).selectionStart == '0'
        ) {
            let startPos = document.getElementById(name).selectionStart;
            let endPos = document.getElementById(name).selectionEnd;
            let myPos = document.getElementById(name).value;

            document.getElementById(name).value = myPos.substring(0, startPos) + data + myPos.substring(endPos, myPos.length);
        } else {
            document.getElementById(name).value += data;
        }
    } else {
        let selection = editor.getSelection();
        let id = { major: 1, minor: 1 };             
        let text = data;
        let op = {
            identifier: id, 
            range: selection, 
            text: text, 
            forceMoveMarkers: true
        };
        
        editor.executeEdits("my-source", [op]);
    }
}

// 아직 개편이 더 필요함
function do_paste_image(name, monaco_name) {
    window.addEventListener('DOMContentLoaded', async function() {
        let set = await opennamu_get_main_skin_set("main_css_image_paste");
        if(set === 'use') {
            let textarea;
            if(
                document.getElementById(monaco_name) !== null &&
                document.getElementById(monaco_name) !== undefined
            ) {
                textarea = document.getElementById(monaco_name);
            } else {
                textarea = document.getElementById(name);
            }

            if(textarea) {
                textarea.addEventListener("paste", pasteListener);
            }
        }
    });
}

function pasteListener(e) {
    // find file
    if(e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        const formData = new FormData();

        let haveImageInClipboard = false;
        let file_name = '';
        
        for(let i = 0; i < items.length; i++) {
            if(items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                const customName = prompt("파일 이름 (확장자 제외)");
                
                if(!customName) {
                    return alert("파일 이름 없음");
                }
                
                file_name = customName + ".png";
                
                const customFile = new File([file], file_name, { type: file.type });
                formData.append("f_data[]", customFile);
                
                haveImageInClipboard = true;
                e.preventDefault();
                
                break;
            }
        }

        if(!haveImageInClipboard) {
            return;
        }

        // send to server
        fetch("/upload", {
            method: "POST",
            body: formData,
        }).then((res) => {
            if (res.status === 200 || res.status === 201) {
                const url = res.url;
                alert(
                    '업로드 완료 : ' +
                    '[[파일:' + file_name + ']]'
                );
            } else {
                console.error("[ERROR] PasteUpload Fail :", res.statusText);
                if(res.status === 400) {
                    alert("파일 이름 중복");
                } else if(res.status === 401) {
                    alert("권한 부족");    
                } else {
                    alert("업로드 실패");        
                }
            }
        }).catch((err) => {
            console.error("오류 내역 :", JSON.stringify(err), err);
            alert("업로드 실패");
        });
    }
}

function do_stop_exit() {
    window.onbeforeunload = function() {
        do_monaco_to_textarea();

        let data = document.getElementById('opennamu_edit_textarea').value;
        let origin = document.getElementById('opennamu_edit_origin').value;
        if(data !== origin) {
            return '';
        }
    }
}

function do_stop_exit_release() {
    window.onbeforeunload = function () {}
}

function opennamu_edit_turn_off_monaco() {
    do_monaco_to_textarea();
    
    document.getElementById('opennamu_edit_textarea').style.display = 'block';
    document.getElementById('opennamu_monaco_editor').style.display = 'none';
    document.getElementById('opennamu_monaco_editor').remove();
}

function do_monaco_to_textarea() {
    if(document.getElementById('opennamu_monaco_editor')) {
        try {
            document.getElementById('opennamu_edit_textarea').value = window.editor.getValue();
        } catch(e) {}
    }
}

function do_monaco_init(monaco_thema) {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.37.1/min/vs' }});
    require.config({ 'vs/nls': { availableLanguages: { '*': 'ko' } }});
    require(["vs/editor/editor.main"], function () {
        window.editor = monaco.editor.create(document.getElementById('opennamu_monaco_editor'), {
            value: document.getElementById('opennamu_edit_textarea').value,
            language: 'plaintext',
            automaticLayout: true,
            wordWrap: true,
            theme: monaco_thema
        });
    });
}