from .tool.func import *
from .user_setting_skin_set_main import user_setting_skin_set_main_set_list

def main_setting_skin_set():
    with get_db_connect() as conn:
        curs = conn.cursor()

        ip = ip_check()
        if ban_check(ip) == 1:
            return re_error('/ban')
            
        set_list = user_setting_skin_set_main_set_list()

        if flask.request.method == 'POST':
            for for_b in set_list:
                curs.execute(db_change('select data from other where name = ?'), [for_b])
                if curs.fetchall():
                    curs.execute(db_change("update other set data = ? where name = ?"), [
                        flask.request.form.get(for_b, set_list[for_b][0][0]),
                        for_b
                    ])
                else:
                    curs.execute(db_change('insert into other (name, data, coverage) values (?, ?, "")'), [
                        for_b, 
                        flask.request.form.get(for_b, set_list[for_b][0][0])
                    ])
            
            conn.commit()

            admin_check(None, 'edit_set (skin_set)')

            return redirect('/setting/skin_set')
        else:
            set_data = {}
            for for_b in set_list:
                set_data[for_b] = ''

                curs.execute(db_change('select data from other where name = ?'), [for_b])
                db_data = curs.fetchall()
                get_data = db_data[0][0] if db_data else ''

                for for_a in set_list[for_b]:
                    if get_data == for_a[0]:
                        set_data[for_b] = '<option value="' + for_a[0] + '">' + for_a[1] + '</option>' + set_data[for_b]
                    else:
                        set_data[for_b] += '<option value="' + for_a[0] + '">' + for_a[1] + '</option>'

            return easy_minify(flask.render_template(skin_check(),
                imp = [load_lang('main_skin_set_default'), wiki_set(), wiki_custom(), wiki_css(['(' + load_lang('beta') + ')', 0])],
                data = render_simple_set('''
                    <form method="post">
                        <h2>''' + load_lang("render") + '''</h2>
                        <h3>''' + load_lang("strike") + '''</h3>
                        <select name="main_css_strike">
                            ''' + set_data["main_css_strike"] + '''
                        </select>
                        <h3>''' + load_lang("bold") + '''</h3>
                        <select name="main_css_bold">
                            ''' + set_data["main_css_bold"] + '''
                        </select>
                        <h3>''' + load_lang("category") + '''</h3>
                        <select name="main_css_category_set">
                            ''' + set_data["main_css_category_set"] + '''
                        </select>
                        <h3>''' + load_lang("footnote") + '''</h3>
                        <select name="main_css_footnote_set">
                            ''' + set_data["main_css_footnote_set"] + '''
                        </select>
                        <h3>''' + load_lang("include_link") + '''</h3>
                        <select name="main_css_include_link">
                            ''' + set_data["main_css_include_link"] + '''
                        </select>
                        <h3>''' + load_lang("image") + '''</h3>
                        <select name="main_css_image_set">
                            ''' + set_data["main_css_image_set"] + '''
                        </select>
                        <h3>''' + load_lang("toc") + '''</h3>
                        <select name="main_css_toc_set">
                            ''' + set_data["main_css_toc_set"] + '''
                        </select>
                        <h3>''' + load_lang("exter_link") + '''</h3>
                        <select name="main_css_exter_link">
                            ''' + set_data["main_css_exter_link"] + '''
                        </select>
                        <h3>''' + load_lang("link_delimiter") + '''</h3>
                        <select name="main_css_link_delimiter">
                            ''' + set_data["main_css_link_delimiter"] + '''
                        </select>
                        <h3>''' + load_lang("force_darkmode") + ''' (''' + load_lang("not_working") + ''')</h3>
                        <select name="main_css_darkmode">
                            ''' + set_data["main_css_darkmode"] + '''
                        </select>
                        <h2>''' + load_lang("edit") + '''</h2>
                        <h3>''' + load_lang("image_paste") + '''</h3>
                        <sup>''' + load_lang('only_korean') + '''</sup> <sup>''' + load_lang('unavailable_in_monaco') + '''</sup>
                        <hr class="main_hr">
                        <select name="main_css_image_paste">
                            ''' + set_data["main_css_image_paste"] + '''
                        </select>
                        <h3>''' + load_lang("monaco_editor") + '''</h3>
                        <select name="main_css_monaco">
                            ''' + set_data["main_css_monaco"] + '''
                        </select>
                        <hr class="main_hr">
                        <button type="submit">''' + load_lang('save') + '''</button>
                    </form>
                '''),
                menu = [['setting', load_lang('return')]]
            ))