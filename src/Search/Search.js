import React from 'react';
import classnames from "classnames";
import './style.css';
import {API_URLS} from "../config/api"
import {debounce} from "../util"
import {MESSAGES} from "../config/message";

class PlaceSearch extends React.Component {
    constructor (props) {
        super(props);
        this.inputRef = null
        this.state = {
            query: "",
            data: [],
            afterSearchData: [],
            noDataFound: false,
            active: false
        }
    }
    componentDidMount () {
        fetch(API_URLS.INPUT_DATA)
            .then(response => response.json())
            .then(data => {
                this.setState({data: data})
            });
    }

    searchByValue = (query) => {
        const {data} = this.state;
        const newData = data.reduce((acc, next) => {
            const name = next.name.toLowerCase();
            const id = next.id.toLowerCase();
            const address = next.address.toLowerCase();
            const q = query.toLowerCase().trim()
            if(name.includes(q) || id.includes(q) || address.includes(q)) {
                acc.push(next)
            }
            return acc;
        }, [])
        if(newData.length > 0) {
            this.setState({
                afterSearchData: newData,
                noDataFound: false
            })
        } else {
            this.setState({
                afterSearchData: [],
                noDataFound: true
            })
        }
    }
    onSearchChange = (ev) => {
        const query = ev.target.value;
        if(query.length != 0) {
            this.setState({query: query})
            debounce(this.searchByValue(query), 200)
        } else {
            this.setState({query: ""})
            this.setState({afterSearchData: []});
        }
    }

    clearInput = () => {this.setState({query: ""})}

    selectResult = (e) => {
        const targetElem = e.target.parentElement.getAttribute('dataname')
        if(targetElem) {
            this.setState({query: targetElem})
        }
    }

    scrollList = () => {
        const {query} = this.state
        if(query.length) {
            const ul = this.listRef;
            let liSelected;
            let index = -1;
            let next;
            function removeClass (el, className) {
                el.classList ? el.classList.remove(className) : el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            };
            function addClass (el, className) {
                el.classList ? el.classList.add(className) : el.className += ' ' + className
            };
            document.addEventListener('keydown', (event) => {
                let len = ul.getElementsByTagName('li').length - 1;
                if(event.which === 40) {
                    index++;
                    if(liSelected) {
                        removeClass(liSelected, 'selected');
                        next = ul.getElementsByTagName('li')[index];
                        if(typeof next !== undefined && index <= len) {
                            liSelected = next;
                            next.scrollIntoView(true);
                        } else {
                            index = 0;
                            liSelected = ul.getElementsByTagName('li')[0];
                            liSelected.scrollIntoView(true);
                        }
                        addClass(liSelected, 'selected');
                    }
                    else {
                        index = 0;
                        liSelected = ul.getElementsByTagName('li')[0];
                        liSelected.scrollIntoView(true)
                        addClass(liSelected, 'selected');
                    }
                }
                else if(event.which === 38) {
                    if(liSelected) {
                        removeClass(liSelected, 'selected');
                        index--;
                        next = ul.getElementsByTagName('li')[index];
                        if(typeof next !== undefined && index >= 0) {
                            liSelected = next;
                            next.scrollIntoView(true)
                        } else {
                            index = len;
                            liSelected = ul.getElementsByTagName('li')[len];
                            liSelected.scrollIntoView(true)
                        }
                        addClass(liSelected, 'selected');
                    }
                    else {
                        index = 0;
                        liSelected = ul.getElementsByTagName('li')[len];
                        liSelected.scrollIntoView(true)
                        addClass(liSelected, 'selected');
                    }
                }
            }, false);

        }
    }
    componentDidUpdate () {
        this.scrollList();
    }
    render () {
        const {query, afterSearchData, noDataFound} = this.state
        return (
            <div className="wrap">
                <div className="search">
                    <input id="input" className="searchTerm" type="text" value={query} onChange={this.onSearchChange} placeholder={MESSAGES.INPUT_PLACEHOLDER} onKeyDown={this.handleKeyDown} />
                    <i className="fa fa-search searchButton"> </i>
                    {query.length ?
                        <React.Fragment>
                            <i className="fa fa-times clearButton" onClick={this.clearInput} > </i>
                            <ul className="searchList" id="list" ref={e => (this.listRef = e)}>
                                {noDataFound ? <li className="noDataFound" >{MESSAGES.NO_DATA_FOUND}</li> :
                                    afterSearchData.map((user, i) => (<li tabIndex="1" role="listitem" key={i}
                                        className={classnames("searchListLi")}
                                        onClick={this.selectResult}
                                        dataname={user.name}>
                                        <span className="userId" > {user.id} </span>
                                        <span className="userName" > {user.name} </span>
                                        <span className="userAddress" > {user.address} </span>
                                    </li>
                                    ))
                                }
                            </ul>
                        </React.Fragment> : null
                    }
                </div>
            </div>
        );
    }
}

export default PlaceSearch;