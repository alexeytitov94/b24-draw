function generatePng(format, name, w, h, svg, type_export, user_id) {

    let s = new XMLSerializer();
    let str = s.serializeToString(svg);

    let imgsrc = 'data:image/svg+xml;base64,'+ btoa(str);
    let canvas = document.querySelector("canvas");

    context = canvas.getContext("2d");
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);


    let image = new Image;
    image.src = imgsrc;

    image.onload = function() {

        context.drawImage(image, 0, 0);

        if(type_export == 'life') {
            //Добавялем файл в живую ленту
            let canvasdata = canvas.toDataURL("image/png").slice(22);
            liveLent(canvasdata, name);
        } else if (type_export == 'save'){
            //Сохраняем файл
            let canvasdata1 = canvas.toDataURL("image/png");
            let a = document.createElement("a");
            a.download = name;
            a.href = canvasdata1;
            let new_a = document.body.appendChild(a);
            //canvas.parentNode.removeChild(canvas);

            new_a.click();

        } else {
            //Cохраняем на диск или отправляем пользователю
            let canvasdata = canvas.toDataURL("image/png").slice(22);
            uplodaDisk(canvasdata, name, user_id, type_export);
        }

    }







    // var s = new XMLSerializer();
    // var str = s.serializeToString(svg);
    //
    // var imgsrc = 'data:image/svg+xml;base64,'+ btoa(str);
    //
    // var canvas = document.querySelector("canvas"),
    //     context = canvas.getContext("2d");
    //     canvas.setAttribute('width', w);
    //     canvas.setAttribute('height', h);
    //
    // var image = new Image;
    // image.src = imgsrc;
    //
    //
    // if (type_export == 'user') {
    //     if (format == 'png') {
    //
    //         image.onload = function() {
    //
    //             context.drawImage(image, 0, 0);
    //             var canvasdata = canvas.toDataURL("image/png").slice(22);
    //
    //             console.log(name)
    //             console.log(canvasdata)
    //
    //             BX24.callMethod(
    //                 "im.message.add",
    //                 {
    //                     'DIALOG_ID': user_id,
    //                     'MESSAGE': 'Файл из приложения',
    //                     'SYSTEM': 'Y',
    //                     'ATTACH': [
    //                         {
    //                             'IMAGE': {
    //                                 'NAME': name,
    //                                 'LINK': canvasdata
    //                             }
    //                         }
    //                     ],
    //                 },
    //                 function(result)
    //                 {
    //                     if(result.error())
    //                     {
    //                         console.error(result.error());
    //                     }
    //                     else
    //                     {
    //                         console.info(result.data());
    //                     }
    //                 }
    //             );
    //
    //
    //         };
    //
    //     }
    //
    // } else if (type_export == 'disk') {
    //
    // }

    //
    //
    //
    // if (format == 'png') {
    //
    //     image.onload = function() {
    //
    //         context.drawImage(image, 0, 0);
    //         var canvasdata = canvas.toDataURL("image/png");
    //         var a = document.createElement("a");
    //         a.download = name;
    //         a.href = canvasdata;
    //         var new_a = document.body.appendChild(a);
    //         canvas.parentNode.removeChild(canvas);
    //
    //
    //         new_a.click();
    //     };
    //
    // } else if (format == 'svg') {
    //
    // } else if (format == 'pdf') {
    //
    // }
    //
    //
    // canvas.innerHTML = '';

}

function  uplodaDisk(file, name, user_id, type_export) {


    var d = new Date,
        dformat = [d.getMonth()+1,
                d.getDate(),
                d.getFullYear()].join('/')+' '+
            [d.getHours(),
                d.getMinutes(),
                d.getSeconds()].join(':');



    //Получаю пользователя
    BX24.callMethod('user.current', {}, function(res){
        //Получаю основное хранилище пользователя
        BX24.callMethod(
            "disk.storage.getlist",
            {
                filter: {
                    ENTITY_TYPE: "user",
                    ENTITY_ID: res.data().ID
                }
            },
            function (result)
            {
                $id_disk = result.data()[0].ROOT_OBJECT_ID

                //Добавляем файл в корневую папку пользователя
                BX24.callMethod(
                    "disk.folder.uploadfile",
                    {
                        id: $id_disk,
                        data: {
                            NAME: dformat + ' ' + name
                        },
                        fileContent: file
                    },
                    function (result)
                    {
                        var link = result.data().DETAIL_URL

                        console.log(result.data())


                        if (type_export == 'user') {
                            BX24.callMethod(
                                "im.message.add",
                                {
                                    'DIALOG_ID': user_id,
                                    'MESSAGE': 'Файл из приложения',
                                    'SYSTEM': 'Y',
                                    'ATTACH': [
                                        {
                                            'FILE': {
                                                'NAME': 'Файл из приложения',
                                                'LINK': link
                                            }
                                        }
                                    ],
                                },
                                function(result)
                                {
                                    if(result.error())
                                    {
                                        console.error(result.error());
                                    }
                                    else
                                    {
                                        alert('Сообщение отправлено пользователю');
                                    }
                                }
                            );
                        }

                    }
                );
            }
        );
    });


}

function liveLent(file, name) {
    BX24.callMethod('log.blogpost.add', {
        POST_MESSAGE: 'Файл из приложения',
        DEST: ['UA'],
        FILES: [
            [
                name,
                file
            ]
        ]


    }, function(r){
        if(!r.error())
        {
            alert('Сообщение добавлено в живую ленту');
        }
        else
        {
            throw r.error();
        }
    });
}





function sizeWindow() {
    BX24.fitWindow(function (response) {
        var size = '';

        size = response;
        size.height += 100;

        setTimeout(function () {
            BX24.resizeWindow(size.width, size.height);
        }, 1000)

    });
}
