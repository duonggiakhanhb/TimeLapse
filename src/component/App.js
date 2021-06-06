import React, { Component } from 'react';
import { KeyboardAvoidingView, ImageBackground, Image, Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import Task from './Task';
import { Audio } from 'expo-av';
import * as Font from "expo-font";
import Svg, {Ellipse, Path, Rect} from "react-native-svg";
class App extends Component{
  state = {
    id: 0,
    idCurr: 0,
    timeDefault: 15,
    editing: false,
    editDisabled: false,
    save: false,
    stop: false,
    start: false,
    disable: false,
    updating: false,
    task: {
      'id': 0,
      'name': '',
      'timeLapse': null,
      'restTime': null,
      'run': {
        'i': false,
        'finish': false,
        'restFinish': false,
      }
    },
    taskItems: [],
    fontsLoaded: false,
  }

  componentDidMount() {
    this.sound = new Audio.Sound();
    this.beginS = new Audio.Sound();
    this.endS = new Audio.Sound();
    if (!this.state.fontsLoaded)
    {
      this.sound.loadAsync(require('./data/sound/endTime.wav'));
      this.beginS.loadAsync(require('./data/sound/begin.wav'));
      this.endS.loadAsync(require('./data/sound/end.mp3'));
      this.loadFonts();
    }
  }
  componentWillUnmount() {
    this.endS.pauseAsync();
    this.beginS.pauseAsync();
    this.sound.pauseAsync();
  }

  async loadFonts(){
    await Font.loadAsync({
      'Roboto-Bold': require('./data/fonts/Roboto-Bold.ttf'),
      'Roboto-Regular': require('./data/fonts/Roboto-Regular.ttf'),
    });
    this.setState({fontsLoaded: true});
  }
  /*Navabar*/
  activeEdit = () => {
    this.restart();
    if (this.state.editing === true ) this.setState({ disable: false });
    this.setState({ editing: !this.state.editing });

  }
  /*CRUD*/
    /*Add*/
  handleAddTask = () => {
    Keyboard.dismiss();
    let task = this.state.task;
    task.timeLapse = task.timeLapse ??  15;
    task.restTime = task.restTime ?? 15;
    if (task.timeLapse == '') task.timeLapse = 0;
    if (task.restTime == '') task.restTime = 0;
    this.setState({task});
    this.setState({
      taskItems: [...this.state.taskItems, this.state.task],
      task: {
        'id': this.state.task.id + 1,
        'name': '',
        'timeLapse': this.state.task.timeLapse,
        'restTime': this.state.task.restTime,
        'run': {
          'i': false,
          'finish': false,
          'restFinish': false,
        }
      },
    });
  }
    /*Delete*/
  deleteTask = (id) => {
    let taskItems = [...this.state.taskItems];
    let index = taskItems.findIndex((item) => item.id === id);
    taskItems.splice(index, 1);
    this.setState({taskItems, disable: false, updating: false, editDisabled: false });
  }
    /*Update*/
  update = (id, time, restTime, name) => {
    let taskItems = [...this.state.taskItems];
    let index = taskItems.findIndex((item) => item.id === id);
    taskItems[index].timeLapse = time;
    taskItems[index].restTime = restTime;
    taskItems[index].name = name;
    this.setState({taskItems});
  }
  disableTouch = () => {
    this.setState( { disable: !this.state.disable, updating: !this.state.updating, editDisabled: !this.state.editDisabled } );
  }
    /*Input Value*/
  changeText = (text) =>{
    let task = this.state.task;
    task.name = text;
    this.setState({task});
  }
  changeTime = (time, prop) =>{
    console.log(time);
    let task = this.state.task;
    task[prop] = time;
    this.setState({task});
  }
  /*Button*/
    /*Restart*/
    restart = () => {
        this.endS.pauseAsync();
        this.beginS.pauseAsync();
        this.sound.pauseAsync();
        let taskItems = this.state.taskItems;
        taskItems.map((item) => {
            item.run.i = false;
            item.run.finish = false;
        });
        this.setState({taskItems});
        this.setState({id: this.state.id + 1});
      if (taskItems.length !== 0) {
        this.setState({start: true, stop: false});
        this.setState({idCurr: this.state.taskItems[0].id});
      } else {
        this.setState({start: false});
        return;
      }
    }
    /*Start*/
  startHandle = () => {
    let taskItems = [...this.state.taskItems];
    let index = taskItems.findIndex(item =>
        item.id === this.state.idCurr
    );
    taskItems[index] = {...taskItems[index],run: {i: true, finish: taskItems[index].run.finish}}
    this.setState({ taskItems, stop: true, start: false });
    this.beginS.replayAsync();
  }
    /*Stop*/
  stopHandle = () => {
    let taskItems = [...this.state.taskItems];
    let index = taskItems.findIndex(item =>
        item.id === this.state.idCurr
    );
    let task = taskItems[index];
    task.stop = true;
    taskItems[index] = task;
    this.setState({ taskItems, start: true, stop: false });

  }
  /*Function*/
  setIdCurr = (id) => {
    if (this.state.taskItems.length <= id ) {
      this.setState({ stop: false, start: false });
      this.endS.pauseAsync();
      this.sound.replayAsync();
      return;
    }
    this.setState({idCurr: this.state.taskItems[id].id })
  }
  nextTask = (index, iValue, fValue, rValue= false) => {
    if (index >= this.state.taskItems.length ) return;
    this.setState(({taskItems}) => ({
      taskItems: [
        ...taskItems.slice(0,index),
        {
          ...taskItems[index],
          run: {
            i: iValue,
            finish: fValue,
            restFinish: rValue,
          },
        },
        ...taskItems.slice(index+1)
      ]
    }));
  }
  render() {
    /*var backMain = !this.state.editing
        ? require("./data/image/backGroundMain.png")
        : require("./data/image/backGround2.png");*/
    var backMain = require("./data/image/background/background.png")
    if(!this.state.fontsLoaded){
      return (
          <View>
            <Text>Adam</Text>
          </View>
      )
    }
    return (
        <View key={this.state.id} style={styles.container}>
          <ImageBackground source={backMain} style={styles.background}>
          {/* Navabar */}
          <View style={styles.nav}>
            <Text style={[styles.Title, this.state.editing && {color: '#671F00'}]}>Today's tasks</Text>

            <TouchableOpacity disabled={this.state.editDisabled} style={styles.edit} onPress={this.activeEdit} >
                {/*If editing turn on: "editing" is "Red", else "Blue"*/}
            {/*<Text style={[styles.editText, this.state.editing && true ? {color: 'red'} : {color: 'blue'}]}>Edit</Text>*/}
              <Image style={styles.editVector} source={require("./data/image/icon/more.png")} />
            </TouchableOpacity>
          </View>
          {/* Added this scroll view to enable scrolling when list gets longer than the page */}
          <ScrollView
              contentContainerStyle={{
                flexGrow: 1
              }}
              keyboardShouldPersistTaps='handled'
          >
            <View style={styles.tasksWrapper}>
              <View style={styles.items}>
                {/* This is where the tasks will go! */}
                {
                  this.state.taskItems.map((item, index) => {
                    return (
                        <Task key={item.id} id={index} text={item}
                              setId={this.setIdCurr} run={item.run} stop={this.state.stop}
                              idCurr={this.state.idCurr}
                              disable={this.state.disable}
                              disableTouch={this.disableTouch}
                              beginS={this.beginS}
                              endS={this.endS}
                              edit={this.state.editing}
                              update={this.update}
                              next={this.nextTask} delete={this.deleteTask}

                        />
                    )
                  })
                }
              </View>
            </View>

          </ScrollView>

          {/* Write a task */}
          {/* Uses a keyboard avoiding view which ensures the keyboard does not cover the items on screen */}
            {/* If editing true */}
          {this.state.editing ? !this.state.updating &&
              /* If updating false display Add, else is nothing */
              <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "position" : "height"}
              style={styles.writeTaskWrapper}
          >
                <View style={styles.writeFooter} >
                  <TextInput style={styles.nameInput} placeholder={'Write a task'} value={this.state.task.name}
                             onChangeText={text => this.changeText(text)}/>
                  <View style={styles.timeInput} >
                    <TextInput keyboardType={'number-pad'} style={[styles.time, styles.timeC]} placeholder={(this.state.task.timeLapse ?? this.state.timeDefault).toString()} value={(this.state.task.timeLapse ?? 15).toString()}
                               onChangeText={time => this.changeTime(time, 'timeLapse')}/>
                    <TextInput keyboardType={'number-pad'} style={[styles.time, styles.timeR]} placeholder={(this.state.task.restTime ?? this.state.timeDefault).toString()} value={(this.state.task.restTime ?? 15).toString()}
                               onChangeText={time => this.changeTime(time, 'restTime')}/>
                  </View>
                  <TouchableOpacity onPress={this.handleAddTask} style={styles.btnAdd}>
                    <Svg width="66" height="65" viewBox="0 0 66 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Ellipse cx="33.1568" cy="32.5" rx="32.8432" ry="32.5" fill="#FFF16E" fill-opacity="0.88"/>
                      <Path d="M64.5 32.5C64.5 49.606 50.4821 63.5 33.1568 63.5C15.8315 63.5 1.8136 49.606 1.8136 32.5C1.8136 15.394 15.8315 1.5 33.1568 1.5C50.4821 1.5 64.5 15.394 64.5 32.5Z" stroke="#0D0D0D" strokeOpacity="0.75" strokeWidth="3"/>
                      <Path d="M42.0974 33.7639H34.434V41.3472H31.8795V33.7639H24.2161V31.2361H31.8795V23.6528H34.434V31.2361H42.0974V33.7639Z" fill="#0D0D0D"/>
                    </Svg>

                  </TouchableOpacity>
                </View>
          </KeyboardAvoidingView>
            : /* Button Display (editing is false) */
              <View style={styles.Footer}>
                {!this.state.stop
                    ? <TouchableOpacity onPress={this.startHandle}
                                                      style={[styles.Start, (this.state.taskItems.length === 0 ) && {opacity: 0.8}]}
                                                      disabled={!this.state.start}>
                  <Svg width="223" height="56" viewBox="0 0 223 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Rect x="3" y="3" width="217" height="50" rx="25" fill="#7FEB3C" stroke="#7FEB3C" strokeOpacity="0.23" strokeWidth="5" strokeLinejoin="round"/>
                    <Path d="M97.9746 31.2695C97.9746 30.7161 97.7793 30.293 97.3887 30C96.998 29.7005 96.2949 29.388 95.2793 29.0625C94.2637 28.7305 93.4596 28.4049 92.8672 28.0859C91.2526 27.2135 90.4453 26.0384 90.4453 24.5605C90.4453 23.7923 90.6602 23.1087 91.0898 22.5098C91.526 21.9043 92.1478 21.4323 92.9551 21.0938C93.7689 20.7552 94.6803 20.5859 95.6895 20.5859C96.7051 20.5859 97.61 20.7715 98.4043 21.1426C99.1986 21.5072 99.8138 22.0247 100.25 22.6953C100.693 23.3659 100.914 24.1276 100.914 24.9805H97.9844C97.9844 24.3294 97.7793 23.8249 97.3691 23.4668C96.959 23.1022 96.3828 22.9199 95.6406 22.9199C94.9245 22.9199 94.3678 23.0729 93.9707 23.3789C93.5736 23.6784 93.375 24.0755 93.375 24.5703C93.375 25.0326 93.6061 25.4199 94.0684 25.7324C94.5371 26.0449 95.224 26.3379 96.1289 26.6113C97.7956 27.1126 99.0098 27.7344 99.7715 28.4766C100.533 29.2188 100.914 30.1432 100.914 31.25C100.914 32.4805 100.449 33.4473 99.5176 34.1504C98.5866 34.847 97.3333 35.1953 95.7578 35.1953C94.6641 35.1953 93.668 34.9967 92.7695 34.5996C91.8711 34.196 91.1842 33.6458 90.709 32.9492C90.2402 32.2526 90.0059 31.4453 90.0059 30.5273H92.9453C92.9453 32.0964 93.8828 32.8809 95.7578 32.8809C96.4544 32.8809 96.998 32.7409 97.3887 32.4609C97.7793 32.1745 97.9746 31.7773 97.9746 31.2695ZM106.1 21.8359V24.4336H107.906V26.5039H106.1V31.7773C106.1 32.168 106.174 32.4479 106.324 32.6172C106.474 32.7865 106.76 32.8711 107.184 32.8711C107.496 32.8711 107.773 32.8483 108.014 32.8027V34.9414C107.46 35.1107 106.891 35.1953 106.305 35.1953C104.326 35.1953 103.316 34.196 103.277 32.1973V26.5039H101.734V24.4336H103.277V21.8359H106.1ZM115.602 35C115.471 34.7461 115.377 34.4303 115.318 34.0527C114.635 34.8145 113.746 35.1953 112.652 35.1953C111.617 35.1953 110.758 34.8958 110.074 34.2969C109.397 33.6979 109.059 32.9427 109.059 32.0312C109.059 30.9115 109.472 30.0521 110.299 29.4531C111.132 28.8542 112.333 28.5514 113.902 28.5449H115.201V27.9395C115.201 27.4512 115.074 27.0605 114.82 26.7676C114.573 26.4746 114.179 26.3281 113.639 26.3281C113.163 26.3281 112.789 26.4421 112.516 26.6699C112.249 26.8978 112.115 27.2103 112.115 27.6074H109.293C109.293 26.9954 109.482 26.429 109.859 25.9082C110.237 25.3874 110.771 24.9805 111.461 24.6875C112.151 24.388 112.926 24.2383 113.785 24.2383C115.087 24.2383 116.119 24.5671 116.881 25.2246C117.649 25.8757 118.033 26.7936 118.033 27.9785V32.5586C118.04 33.5612 118.18 34.3197 118.453 34.834V35H115.602ZM113.268 33.0371C113.684 33.0371 114.068 32.946 114.42 32.7637C114.771 32.5749 115.032 32.3242 115.201 32.0117V30.1953H114.146C112.734 30.1953 111.982 30.6836 111.891 31.6602L111.881 31.8262C111.881 32.1777 112.005 32.4674 112.252 32.6953C112.499 32.9232 112.838 33.0371 113.268 33.0371ZM126.139 27.0801C125.755 27.028 125.416 27.002 125.123 27.002C124.055 27.002 123.355 27.3633 123.023 28.0859V35H120.201V24.4336H122.867L122.945 25.6934C123.512 24.7233 124.296 24.2383 125.299 24.2383C125.611 24.2383 125.904 24.2806 126.178 24.3652L126.139 27.0801ZM131.373 21.8359V24.4336H133.18V26.5039H131.373V31.7773C131.373 32.168 131.448 32.4479 131.598 32.6172C131.747 32.7865 132.034 32.8711 132.457 32.8711C132.77 32.8711 133.046 32.8483 133.287 32.8027V34.9414C132.734 35.1107 132.164 35.1953 131.578 35.1953C129.599 35.1953 128.59 34.196 128.551 32.1973V26.5039H127.008V24.4336H128.551V21.8359H131.373Z" fill="white"/>
                  </Svg>
                </TouchableOpacity>
                : <TouchableOpacity onPress={this.stopHandle}
                                    style={styles.Start}
                                    disabled={!this.state.stop}>
                      <Svg width="223" height="56" viewBox="0 0 223 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <Rect x="3" y="3" width="217" height="50" rx="25" fill="#C24024" stroke="#C24024" strokeOpacity="0.38" strokeWidth="5" strokeLinejoin="round"/>
                        <Path d="M99.4688 31.2695C99.4688 30.7161 99.2734 30.293 98.8828 30C98.4922 29.7005 97.7891 29.388 96.7734 29.0625C95.7578 28.7305 94.9538 28.4049 94.3613 28.0859C92.7467 27.2135 91.9395 26.0384 91.9395 24.5605C91.9395 23.7923 92.1543 23.1087 92.584 22.5098C93.0202 21.9043 93.6419 21.4323 94.4492 21.0938C95.263 20.7552 96.1745 20.5859 97.1836 20.5859C98.1992 20.5859 99.1042 20.7715 99.8984 21.1426C100.693 21.5072 101.308 22.0247 101.744 22.6953C102.187 23.3659 102.408 24.1276 102.408 24.9805H99.4785C99.4785 24.3294 99.2734 23.8249 98.8633 23.4668C98.4531 23.1022 97.877 22.9199 97.1348 22.9199C96.4186 22.9199 95.862 23.0729 95.4648 23.3789C95.0677 23.6784 94.8691 24.0755 94.8691 24.5703C94.8691 25.0326 95.1003 25.4199 95.5625 25.7324C96.0312 26.0449 96.7181 26.3379 97.623 26.6113C99.2897 27.1126 100.504 27.7344 101.266 28.4766C102.027 29.2188 102.408 30.1432 102.408 31.25C102.408 32.4805 101.943 33.4473 101.012 34.1504C100.081 34.847 98.8275 35.1953 97.252 35.1953C96.1582 35.1953 95.1621 34.9967 94.2637 34.5996C93.3652 34.196 92.6784 33.6458 92.2031 32.9492C91.7344 32.2526 91.5 31.4453 91.5 30.5273H94.4395C94.4395 32.0964 95.377 32.8809 97.252 32.8809C97.9486 32.8809 98.4922 32.7409 98.8828 32.4609C99.2734 32.1745 99.4688 31.7773 99.4688 31.2695ZM107.594 21.8359V24.4336H109.4V26.5039H107.594V31.7773C107.594 32.168 107.669 32.4479 107.818 32.6172C107.968 32.7865 108.255 32.8711 108.678 32.8711C108.99 32.8711 109.267 32.8483 109.508 32.8027V34.9414C108.954 35.1107 108.385 35.1953 107.799 35.1953C105.82 35.1953 104.811 34.196 104.771 32.1973V26.5039H103.229V24.4336H104.771V21.8359H107.594ZM110.24 29.6191C110.24 28.571 110.442 27.6367 110.846 26.8164C111.249 25.9961 111.829 25.3613 112.584 24.9121C113.346 24.4629 114.228 24.2383 115.23 24.2383C116.656 24.2383 117.818 24.6745 118.717 25.5469C119.622 26.4193 120.126 27.6042 120.23 29.1016L120.25 29.8242C120.25 31.4453 119.798 32.7474 118.893 33.7305C117.988 34.707 116.773 35.1953 115.25 35.1953C113.727 35.1953 112.509 34.707 111.598 33.7305C110.693 32.7539 110.24 31.4258 110.24 29.7461V29.6191ZM113.062 29.8242C113.062 30.8268 113.251 31.5951 113.629 32.1289C114.007 32.6562 114.547 32.9199 115.25 32.9199C115.934 32.9199 116.467 32.6595 116.852 32.1387C117.236 31.6113 117.428 30.7715 117.428 29.6191C117.428 28.6361 117.236 27.8743 116.852 27.334C116.467 26.7936 115.927 26.5234 115.23 26.5234C114.54 26.5234 114.007 26.7936 113.629 27.334C113.251 27.8678 113.062 28.6979 113.062 29.8242ZM131.5 29.8145C131.5 31.4421 131.129 32.7474 130.387 33.7305C129.651 34.707 128.655 35.1953 127.398 35.1953C126.331 35.1953 125.468 34.8242 124.811 34.082V39.0625H121.988V24.4336H124.605L124.703 25.4688C125.387 24.6484 126.279 24.2383 127.379 24.2383C128.681 24.2383 129.693 24.7201 130.416 25.6836C131.139 26.6471 131.5 27.9753 131.5 29.668V29.8145ZM128.678 29.6094C128.678 28.6263 128.502 27.8678 128.15 27.334C127.805 26.8001 127.301 26.5332 126.637 26.5332C125.751 26.5332 125.143 26.8717 124.811 27.5488V31.875C125.156 32.5716 125.771 32.9199 126.656 32.9199C128.004 32.9199 128.678 31.8164 128.678 29.6094Z" fill="white"/>
                      </Svg>
                    </TouchableOpacity>}
                <TouchableOpacity onPress={this.restart} style={styles.Restart}>
                  <Text style={styles.buttonText}>Restart</Text>
                </TouchableOpacity>
            </View>}
          </ImageBackground>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  /* Navabar */
  nav: {
    position: 'relative',
    width: '100%',
    height: 80,
    flexDirection: 'row',
    top: 28,
    zIndex: 10,

  },
  Title: {
    position: "relative",
    fontFamily: "Roboto-Bold",
    fontSize: 35,
    lineHeight: 41,
    color: "#000000",
    left: 20,
    //mixBlendMode: "normal"
  },
  edit: {
    position: "absolute",
    width: 30,
    height: 10,
    right: 10,
  },
  editText: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    fontStyle: "normal",
    fontWeight: "normal",
    lineHeight: 19,
    color: "#000000"
  },
  editVector: {
    width: 24,
    height: 6,
  },
  /* Footer */
  Footer: {
    position: 'absolute',
    width: '100%',
    height: 50,
    bottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',

  },
  Restart: {
    position: 'relative',
    width: 107,
    height: 50,
    backgroundColor: '#424242',
    borderRadius: 40,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 23,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  Start: {
    position: 'relative',
    width: 217,
    height: 50,
  },
  btnStart: {

  },
  writeTaskWrapper: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    bottom: 18,
  },
  writeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 337,
    height: 65,
    alignItems: 'center',
    margin: 'auto',
  },
  nameInput: {
    position: 'relative',
    width: 161,
    height: 47.46,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(13, 13, 13, 0.3)',
    borderWidth: 1,
    borderRadius: 40,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 16,
    alignItems: 'center',
  },
  timeInput: {
    position: 'relative',
    width: 100.91,
    height: 48.04,
    flexDirection: 'row',
  },
  time: {
    position: 'relative',
    width: 47.6,
    height: 47.1,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderStyle: 'solid',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 16,
    left: 5,
    overflow: 'visible',
    borderRadius: 47.6,
    textAlign: 'center',
  },
  timeC: {
    position: 'relative',
    borderColor:'rgba(127, 235, 60, 0.85)',
  },
  timeR: {
    position: 'relative',
    left: 11,
    borderColor:'rgba(13, 13, 13, 0.55)',
  },
  btnAdd: {
    position: 'relative',
    width: 65.69,
    height: 65,
    left: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksWrapper: {
    position: 'relative',
    //height: 482,
    width: '100%',
    top: 30,
  },
  items: {
    alignItems: 'center',
    //marginTop: 30,
    marginBottom: 150,
  },
});
export default App;
