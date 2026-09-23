const fs = require('node:fs');
const Handlebars = require('handlebars');
const path = require('node:path');

function main() {
    let blog_dir = 'views/blog';
    let partials_dir = 'views/partials';
    let index_day = 2;
    let index_title_start=3;
    let year = 1;
    let month = 2;
    let month_map = {
        '01':'January',
        '02':'Febuary',
        '03':'March',
        '04':'April',
        '05':'May',
        '06':'June',
        '07':'July',
        '08':'August',
        '09':'September',
        '10':'October',
        '11':'November',
        '12':'December'
    }

    get_template = (name) => {return Handlebars.compile(fs.readFileSync(partials_dir + '/' + name +'.handlebars', 'utf8'))};
    get_static_text = (name) => {return ()=>{return fs.readFileSync(partials_dir + '/' + name +'.handlebars', 'utf8')}};
    year_top     = get_template('blog-year-top');
    year_bottom  = get_template('blog-year-bottom');
    month_top    = get_template('blog-month-top');
    month_bottom = get_template('blog-month-bottom');
    blog_file    = get_template('blog-file');
    blog_top     = get_template('blog-top');
    blog_bottom  = get_static_text('blog-bottom');

    let entry = get_newest_posts(blog_dir)[0];
    let file_path = path.join(entry.parentPath, entry.name).split('.')[0].split('/').slice(1).join('/');
    let file_name = entry.name.split('.')[0].split('-').slice(index_title_start).join(' ');

    console.log(blog_top({path:file_path,name:file_name}));

    let stack = init_stack(blog_dir);
    while ((item = stack.pop()) !== undefined) {
        switch (item.type) {
            case 'd':
                switch (item.action) {
                    case 'container_top':

                        if (item.level === year) {
                            let year = {year: item.name};
                            console.log(year_top(year));

                        } else if (item.level === month) {
                            let month = {month: month_map[item.name]};
                                console.log(month_top(month));
                        }
                    break;
                    case 'container_bottom':
                        if (item.level === year) {
                            console.log(year_bottom());
                        } else if (item.level === month) {
                            console.log(month_bottom())
                        }
                    break;
                    case 'content':
                        let stack_items = gen_stack_items(item);
                        stack.push(...stack_items);
                    break;
                    default:
                        throw new Error("unknown action: "+item.action+" on dir item: ", item);
                    break;
                }
            break;
            case 'f':
                switch (item.action) {
                    case 'content':
                        let path = item.path.split('.')[0].split('/').slice(1).join('/');
                        let name = item.name.split('.')[0].split('-').slice(index_title_start).join(' ');
                        let day = add_ending(item.name.split('.')[0].split('-')[2]);
                        console.log(blog_file(
                            {
                                path: path,
                                name: name,
                                day: day 
                            }
                        ));
                    break;
                    default:
                        throw new Error("unknown action: "+item.action+" on file item", item);
                    break;
                }
            break;
            default:
                throw new Error("unknown file type: "+item.type, item);
            break;
        }
    }

    console.log(blog_bottom());
}

function init_stack(path) {
    // if it exists and is a directory we want to continue
    if (!fs.existsSync(path)) throw new Error("path: "+path+" does not exist");
    if (!fs.statSync(path).isDirectory()) throw new Error("item: "+path+" is not a directory");

    let stack = [];
    let entry = {};
    entry.path = path;
    entry.name = "";
    entry.level = 0;
    entry.type = 'd';
    entry.action = 'content';

    stack.push(entry);
    return stack;
}


function gen_stack_items(parent) {
    let path = parent.path;
    let level = parent.level;
    if (!fs.existsSync(path)) throw new Error("path: "+path+" does not exist");
    if (!fs.statSync(path).isDirectory()) throw new Error("item: "+path+" is not a directory");

    //reverse
    dir_ents = fs.readdirSync(path);
    let items = []

    for (entry of dir_ents) {
        if (fs.statSync(path+'/'+entry).isDirectory()) {
            let new_item = {
                path:path+'/'+entry,
                name:entry,
                level:level+1,
                type: 'd',
                action:''
            };

            new_item.action = 'container_bottom';
            items.push({...new_item});

            new_item.action = 'content';
            items.push({...new_item});

            new_item.action = 'container_top';
            items.push({...new_item});

        } else {
            let new_item = {
                path:path+'/'+entry,
                name:entry,
                level:level+1,
                type: 'f',
                action:'content'
            };
            items.push(new_item);
        }
    }

    return items;
}

function add_ending(number) {
    if (Number(number) === 1) {
        return number + 'st';
    }

    if (Number(number) === 2) {
        return number + 'nd';
    }

    if (Number(number) === 3) {
        return number + 'rd';
    }

    if (Number(number) > 4) {
        return number + 'th';
    }

    return number;
}

function get_newest_posts(dirPath) {
  const files = fs.readdirSync(dirPath, {recursive:true, withFileTypes:true}).filter( entry => entry.isFile());
  const files_sorted_by_date = files.sort().reverse().slice(0,1);

  return files_sorted_by_date;
}

main();
