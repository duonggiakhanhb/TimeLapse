import React, { Component } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import Task from './Task';
import { Audio } from 'expo-av';

class App extends Component{
  state = {
    id: 0,
    idCurr: 0,
    timeDefault: 15,
    edit: false,
    editDisabled: false,
    save: false,
    stop: false,
    start: false,
    disable: false,
    update: false,
    task: {
      'id': 0,
      'name': '',
      'timeLapse': '',
      'stop': false,
      'run': {
        'i': false,
        'finish': false,
      }
    },
    taskItems: [],
  }

  componentDidMount() {
    this.sound = new Audio.Sound();
    this.sound.loadAsync(require('./data/sound/endTime.wav'));
    this.beginS = new Audio.Sound();
    this.endS = new Audio.Sound();
    this.beginS.loadAsync(require('./data/sound/begin.wav'));
    this.endS.loadAsync(require('./data/sound/end.mp3'));
  }
  componentWillUnmount() {
    this.sound.pauseAsync();
  }

  /*Navabar*/
  activeEdit = () => {
    this.restart();
    if (this.state.edit === true ) this.setState({ disable: false });
    this.setState({ edit: !this.state.edit });

  }
  /*CRUD*/
    /*Add*/
  handleAddTask = () => {

    Keyboard.dismiss();
    let task = this.state.task;
    if (task.timeLapse === '' ) {
      task.timeLapse = this.state.timeDefault ;
    }
    else {
      this.setState({ timeDefault: task.timeLapse });
    }
    this.setState({task});
    this.setState({
      taskItems: [...this.state.taskItems, this.state.task],
      task: {
        'id': this.state.task.id + 1,
        'name': '',
        'timeLapse': '',
        'run': {
          'i': false,
          'finish': false,
        }
      },
    });
  }
    /*Delete*/
  deleteTask = (id) => {
    let taskItems = [...this.state.taskItems];
    let index = taskItems.findIndex((item) => item.id === id);
    taskItems.splice(index, 1);
    this.setState({taskItems, disable: false, update: false, editDisabled: false });
    if (taskItems.length === 0) {
      this.setState({ editDisabled: false });
    }
  }
    /*Update*/
  update = (id, time, name) => {
    let taskItems = [...this.state.taskItems];
    let index = taskItems.findIndex((item) => item.id === id);
    taskItems[index].time = time;
    taskItems[index].name = name;
    this.setState({taskItems});
  }
  disableTouch = () => {

    this.setState( { disable: !this.state.disable, update: !this.state.update, editDisabled: !this.state.editDisabled } );
  }
    /*Input Value*/
  changeText = (text) =>{
    let task = this.state.task;
    task.name = text;
    this.setState({task});
  }
  changeTime = (time) =>{
    let task = this.state.task;
    task.timeLapse = time;
    this.setState({task});
  }
  /*Button*/
    /*Restart*/
  restart = () => {
    let taskItems = this.state.taskItems;
    taskItems.map((item) => {
      item.run.i = false;
      item.run.finish = false;
    });
    this.setState({ taskItems });
    this.setState({ id: this.state.id + 1});
    if(taskItems.length > 0 ) {
      this.setState({ start: true , stop: false });
      this.setState({ idCurr: this.state.taskItems[0].id });
    }
    else {
      this.setState({ start: false });
    }
  }
    /*Start*/
  startHandle = () => {
    let taskItems = [...this.state.taskItems];
    let index = taskItems.findIndex(item =>
        item.id === this.state.idCurr
    );
    taskItems[index] = {...taskItems[index],run: {i: true, finish: false}, stop: false }
    this.setState({ taskItems, stop: true, start: false });
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
      this.sound.playAsync();
      return;
    }
    this.setState({idCurr: this.state.taskItems[id].id })
  }
  nextTask = (index, iValue, fValue) => {
    if (index >= this.state.taskItems.length ) return;
    this.setState(({taskItems}) => ({
      taskItems: [
        ...taskItems.slice(0,index),
        {
          ...taskItems[index],
          run: {
            i: iValue,
            finish: fValue,
          },
        },
        ...taskItems.slice(index+1)
      ]
    }));
  }
  render() {
    return (
        <View key={this.state.id} style={styles.container}>
          {/* Navabar */}
          <View style={styles.nav}>
          <Text style={styles.sectionTitle}>Today's tasks</Text>
            <TouchableOpacity disabled={this.state.editDisabled} style={styles.edit} onPress={this.activeEdit} >
            <Text style={[styles.editText, this.state.edit && true ? {color: 'red'} : {color: 'blue'}]}>Edit</Text>
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
                              setId={this.setIdCurr} run={item.run} stop={item.stop}
                              disable={this.state.disable}
                              disableTouch={this.disableTouch}
                              beginS={this.beginS}
                              endS={this.endS}
                              edit={this.state.edit}
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
          {this.state.edit ? !this.state.update && <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.writeTaskWrapper}
          >
            <TextInput style={[styles.input, styles.head]} placeholder={'Write a task'} value={this.state.task.name}
                       onChangeText={text => this.changeText(text)}/>
            <TextInput keyboardType={'number-pad'} style={[styles.input, styles.time]} placeholder={this.state.timeDefault.toString()} value={this.state.task.timeLapse}
                       onChangeText={time => this.changeTime(time)}/>
            <TouchableOpacity onPress={this.handleAddTask}>
              <View style={styles.addWrapper}>
                <Text style={styles.addText}>+</Text>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
            : /* Button Display */
              <View style={styles.writeTaskWrapper}>
            <TouchableOpacity onPress={this.restart} style={[styles.btnFooter, {backgroundColor: '#1090a3'}]}>
            <Text style={styles.btnText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.startHandle}
                              disabled={!this.state.start}
                              style={[styles.btnFooter,
              !this.state.start && {opacity: 0.5}, {backgroundColor: '#40ce13'}]}>
            <Text style={styles.btnText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.stopHandle}
                              disabled={!this.state.stop}
                              style={[styles.btnFooter,
              !this.state.stop && {opacity: 0.5}, {backgroundColor: '#db2a66'}]}>
            <Text style={styles.btnText}>Stop</Text>
            </TouchableOpacity>
            </View>}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: 'white',
  },
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginLeft: 20,
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  items: {
    marginTop: 30,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  addText: {},
  nav: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  edit: {
    zIndex: 10,
    right: 10,

  },
  editText: {
    fontSize: 16,
  },
  btnFooter: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
},
  btnText: {
    fontSize: 20,
    color: '#fff',

  },
  head: {
    width: 150,
  },
  time: {
    width: 50,
  }
});
export default App;
