
//Основной метод запускающейся при запуске приложения и открытии других проектов
async function getAllDraw() {

    COUNT = 1;

    if (HIDDEN == 0) {
        ID_PROJECT = '';
    }

    $('.st_open_graph_item_loop').each(function () {
        $(this).remove();
    });

    $('.st_open_graph_item_new').addClass('active');


    $('.st_open_graph').hide();
    $('.draw_container-start').show();
    $('.st_open_graph_loader').show();

    $('.overflow').click(function () {
        if (HIDDEN != 0) {
            $('.draw_container-start').hide();
        }
    });

    USER_ID = await getUser();
    var entity = await getEntity();

    if (entity > 0) {
        var draw = [];
        draw = await getDraw();
        //Передать колличество проектов и выключить прелоадер
        $('.st_open_graph').show();
        $('.st_open_graph_loader').hide();

        await projectShow(draw)

    } else {
        await addEntity()
        await addPropertyEntity('preview')
        await addPropertyEntity('user')
        await addPropertyEntity('xml')
        await addPropertyEntity('name')
        loader_draw_start = false;
        var draw = []

        //Передать колличество проектов и выключить прелоадер
        $('.st_open_graph').show();
        $('.st_open_graph_loader').hide();

        await projectShow(draw)
    }
}


//Отображение проектов
async function projectShow(draw) {
    return new Promise(resolve => {

        for (var item of draw) {

            //console.log(item)

            $(".st_open_graph_container_draw").append(
                '<div class="st_open_graph_item st_open_graph_item_loop" data-id-item="' +  item.ID + '">' +
                '<div class="image_back"><img class="preview" src="' + item.PROPERTY_VALUES.preview + '"><div>' +
                '<h5>' + item.PROPERTY_VALUES.name  + '</h5>' +
                    '<div class="option">' +
                        '<img src="styles/active.svg" class="active_svg">' +
                        '<img src="styles/delete.svg" class="delete_svg" data-id-item-delete="' +  item.ID + '">' +
                    '</div>' +
                '</div>'
            );

        }


        //Выбор проекта
        $('.st_open_graph_item').click(function () {

            $('.st_open_graph_item').each(function () {
                $(this).removeClass('active');
            })

            $(this).addClass('active');

            if ($(this).hasClass("st_open_graph_item_new")) {
                $('.footer_graph_new').css('visibility','visible');
                $('.footer_graph_choose').css('visibility','hidden');
            } else {
                $('.footer_graph_new').css('visibility','hidden');
                $('.footer_graph_choose').css('visibility','visible');;
                $('.footer_graph_choose input').attr('value', $(this).find('h5').text())
            }

        });

        //Подтверждение выбора
        $('.footer_graph button').click(function () {

            if (HIDDEN == 0) {
                HIDDEN = 1;
            }

            $('.st_open_graph_item').each(function () {

                if ($(this).hasClass("active")) {

                    var name_project = $('.footer_graph_new input').val();

                    if ($(this).hasClass("st_open_graph_item_new")) {

                        if (COUNT == 1) {

                            console.log('New elements ' + COUNT);
                            COUNT = 2;

                            let d = new Date(new Date().getTime() - 3000000);
                            let name_random = Math.random().toString(36).substring(2)+""+d.getFullYear().toString()+""+((d.getMonth()+1).toString().length==2?(d.getMonth()+1).toString():"0"+(d.getMonth()+1).toString())+""+(d.getDate().toString().length==2?d.getDate().toString():"0"+d.getDate().toString())+""+(d.getHours().toString().length==2?d.getHours().toString():"0"+d.getHours().toString())+""+((parseInt(d.getMinutes()/5)*5).toString().length==2?(parseInt(d.getMinutes()/5)*5).toString():"0"+(parseInt(d.getMinutes()/5)*5).toString())+"00";

                            //Создание проекта
                            BX24.callMethod('entity.item.add', {
                                ENTITY: 'stockwell_draw',
                                NAME: name_random,
                                PROPERTY_VALUES: {
                                    preview: '',
                                    user: USER_ID,
                                    xml: '',
                                    name: name_project,
                                },
                            }, function (res) {

                                var xml = `<mxGraphModel dx="4230" dy="5690" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
                                      <root>
                                        <mxCell id="0"/>
                                        <mxCell id="1" parent="0"/>
                                      </root>
                                    </mxGraphModel>`;
                                var data = Graph.zapGremlins(mxUtils.trim(xml));

                                STOCKWELL_GLOBAL_UI.editor.graph.model.beginUpdate();
                                try
                                {
                                    STOCKWELL_GLOBAL_UI.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
                                    STOCKWELL_GLOBAL_UI.hideDialog();

                                    ID_PROJECT = res.answer.result
                                    $('.draw_container-start').hide();

                                }
                                catch (e)
                                {
                                    error = e;
                                }
                                finally
                                {
                                    STOCKWELL_GLOBAL_UI.editor.graph.model.endUpdate();
                                }


                            });


                        } else {
                            console.log('Already added ' + COUNT);
                        }














                    } else {

                        choseProjectXML($(this).attr('data-id-item'), draw)

                    }


                }
            })

        })



        //Удаление проекта
        $('.st_open_graph_item .delete_svg').click(function () {

            console.log($(this).attr('data-id-item-delete'))

            $('div[data-id-item=' + $(this).attr('data-id-item-delete') + ']').detach();

            setTimeout(function () {
                $('.st_open_graph_item_new').addClass('active');
                $('.footer_graph_new').css('visibility','visible');
                $('.footer_graph_choose').css('visibility','hidden');
            }, 200)

            BX24.callMethod('entity.item.delete', {
                ENTITY: 'stockwell_draw',
                ID: $(this).attr('data-id-item-delete')
            });

        })

        resolve(true);

    })
}

//Получение пользователя
async function getUser() {
    return new Promise(resolve => {
        BX24.callMethod('user.current', {}, function(res) {
            resolve(res.data().ID)
        });
    })
}

//Получить хранилище
async function getEntity() {
    return new Promise(resolve => {
        BX24.callMethod(
            "entity.get",
            {},
            function(result)
            {
                var count = 0;
                for (let item of result.data()) {
                    if(item.ENTITY == 'stockwell_draw') {
                        count++;
                    }
                }
                resolve(count);
            }
        );
    })

}

//Добавить хранилище
async function addEntity() {
    return new Promise(resolve => {
        BX24.callMethod('entity.add', {
            'ENTITY': 'stockwell_draw',
            'NAME': 'stockwell_draw',
        }, function (res) {
            resolve(res);
        });
    })
}

//Добавить поле в хранилище
async function addPropertyEntity(name) {
    return new Promise(resolve => {
        BX24.callMethod('entity.item.property.add', {
            ENTITY: 'stockwell_draw',
            PROPERTY: name,
            NAME: name,
            TYPE: 'S'
        }, function (res) {
            setTimeout(() => {
                resolve(res)
            }, 1000)
        });
    })
}

//Получить все рисунки пользователя из хранилища - USER_ID
async function getDraw() {
    return new Promise(resolve => {
        BX24.callMethod('entity.item.get', {
            ENTITY: 'stockwell_draw',
            SORT: {ID: 'ASC'},
            FILTER: {}
        }, function (res) {
            resolve(res.answer.result)
        });
    })
}

//Запуск цикла
function startLoop(ui, editor, graph) {
    setInterval(() => {


        if (ID_PROJECT != "") {
            var xml = mxUtils.getXml(ui.editor.getGraphXml());
            var svg = graph.getSvg();

            updateXmlEntity(xml, svg)
        }

    }, SECOND_INTERVAL);
}

//Обновление XML в хранилище
function updateXmlEntity(xml, svg) {

    let s = new XMLSerializer();
    let str = s.serializeToString(svg);
    let imgsrc = 'data:image/svg+xml;base64,'+ btoa(str);


    BX24.callMethod('entity.item.update', {
        ENTITY: 'stockwell_draw',
        ID: ID_PROJECT,
        PROPERTY_VALUES: {
            preview: imgsrc,
            user: USER_ID,
            xml: xml
        }
    }, function (res) {});

}

//Вставить XML выбранного проекта
function choseProjectXML(id_project, draw) {

    for (var item of draw) {

        if (item.ID == id_project) {

            var xml = item.PROPERTY_VALUES.xml
            var data = Graph.zapGremlins(mxUtils.trim(xml));

            STOCKWELL_GLOBAL_UI.editor.graph.model.beginUpdate();
            try
            {

                $('.draw_container-start').hide();

                STOCKWELL_GLOBAL_UI.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
                STOCKWELL_GLOBAL_UI.hideDialog();

                ID_PROJECT = item.ID

            }
            catch (e)
            {
                error = e;
            }
            finally
            {
                STOCKWELL_GLOBAL_UI.editor.graph.model.endUpdate();
            }

        }
    }

}



// ДОП. МЕТОДЫ ДЛЯ РАБОТЫ С БИТРИКСОМ

//Удаление всех записей в хранилище
function deleteAllItemInStorage() {
    BX24.callMethod('entity.item.get', {
        ENTITY: 'stockwell_draw',
        SORT: {ID: 'ASC'},
        FILTER: {}
    }, function (res) {
        console.log(res.answer.result)

        for (var item of res.answer.result) {
            BX24.callMethod('entity.item.delete', {
                ENTITY: 'stockwell_draw',
                ID: item.ID
            });
        }


    });
}

//Удаление хранилища
function deleteStorage() {
    BX24.callMethod('entity.delete', {'ENTITY': 'stockwell_draw'});
}



