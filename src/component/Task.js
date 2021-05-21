import React, { Component } from 'react';
import {View, Text, StyleSheet, KeyboardAvoidingView, TouchableOpacity, TextInput, Platform} from 'react-native';
class Task extends Component{
    constructor(props) {
        super(props);
        this.state = {
            updating: false,
            name: this.props.name,
            time: this.props.text.timeLapse,
            restTime: this.props.text.restTime,

        }
    }
    changeText = (name) =>{
        this.setState({name});
    }
    changeTime = (time, prop) =>{
        this.setState({[prop]: time});
    }
    nextRun = () => {
        this.props.setId(this.props.id + 1);
        this.props.next(this.props.id, false, true);
        this.props.next(this.props.id+1, true, false);
    }
    disableTouch = () => {
        this.props.disableTouch();
        this.setState({ updating: !this.state.updating });
        this.props.update(this.props.text.id, this.state.time, this.state.restTime, this.state.name);
    }

    componentDidMount() {
        this.setState({name: this.props.text.name});
    }

    componentDidUpdate(prevProps) {
        if ( this.props.stop === true ) {
            //this.props.endS.pauseAsync();
            clearInterval(this.intervalTime);
        }
        if ( (prevProps.run.i !== this.props.run.i
            || (prevProps.stop !== this.props.stop && this.props.stop === false ))
            && this.props.run.i === true ) {
            //this.props.beginS.playAsync();
            this.timeCount();
        }
    }
    componentWillUnmount() {
        //this.props.endS.pauseAsync();
        clearInterval(this.intervalTime);
    }

    timeCount = () => {
        this.props.beginS.replayAsync();
        this.props.endS.pauseAsync();
        console.log('be');
        this.intervalTime = setInterval(() => {
            if ( this.state.time === 0 ) {
                clearInterval(this.intervalTime);
                this.props.beginS.pauseAsync();
                this.props.endS.replayAsync();
                this.intervalRest = setInterval(() => {
                    if (this.state.restTime === 0){
                        clearInterval(this.intervalRest);
                        this.nextRun();
                        return;
                    }
                    this.setState({restTime: this.state.restTime -1 });
                },1000);
                return;
            }
            this.setState(
                (prevState) => {
                    return { time: prevState.time - 1 };
                });
        }, 1000);
    }

    render() {
        const { props } = this;
        if( this.state.updating ) {
            return (
                    <KeyboardAvoidingView
                        keyboardVerticalOffset = {64}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                    <TouchableOpacity style={[styles.item, styles.itemUpdate]}
                                      onLongPress={this.disableTouch}>
                        <View style={styles.itemLeft}>
                            <TouchableOpacity
                                onPress={() => props.delete(props.text.id) }>
                                <View style={[styles.square, {backgroundColor: '#ec3d64'} ]}>
                                </View>
                            </TouchableOpacity>
                            <TextInput style={styles.itemText} placeholder={'Write a task'} value={this.state.name} onChangeText={this.changeText} />
                        </View>
                        <TextInput keyboardType={'number-pad'} style={styles.circular} value={this.state.time.toString()} onChangeText={time => this.changeTime(time,'time')}/>
                        <TextInput keyboardType={'number-pad'} style={styles.circular} value={this.state.restTime.toString()} onChangeText={time => this.changeTime(time,'restTime')}/>
                    </TouchableOpacity>
                    </KeyboardAvoidingView>
            );
        }
        return (
            <View>
                <TouchableOpacity style={[styles.item, this.props.disable ? styles.itemNoUpdate : null ]}
                                  /* disabled: edit true, disabled true
                                      disabled: edit false,
                                   */
                                  disabled={this.props.edit ? (this.props.disable) : true  }
                                  onLongPress={this.disableTouch}>
                    <View style={styles.itemLeft}>
                        <TouchableOpacity
                            /*disabled add: edit false or disabled true*/
                            disabled={ !this.props.edit ? true : (this.props.disable) }
                            onPress={() => props.delete(props.text.id) }>
                            <View style={[styles.square, this.props.edit ? {backgroundColor: '#ec3d64'}: null]}>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.itemText}>{this.props.text.name}</Text>
                    </View>
                    <View style={styles.circular}><Text>{this.state.time}</Text></View>
                        <View style={styles.circular}><Text>{this.state.restTime}</Text></View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    itemupdating: {
        width: '100%',
        backgroundColor: '#e0d0d0',
    },
    itemNoUpdate: {
        opacity: 0.5,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    square: {
        width: 24,
        height: 24,
        backgroundColor: '#3f7fec',
        opacity: 0.4,
        borderRadius: 5,
        marginRight: 15,
    },
    itemText: {
        maxWidth: '80%',
    },
    circular: {
        height: 20,
        width: 20,
    },

});

export default Task;
