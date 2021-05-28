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
        this.props.setId(this.props.id + 1);    /* set idCrurrent +1 */
        this.props.next(this.props.id, true, true, true);   /* set restFinish = true */
        this.props.next(this.props.id+1, true, false);      /* in next item change i = true to run */
        return;
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
        /*Stop when props.stop is false*/
        if ( this.props.stop === false ) {
            //this.props.endS.pauseAsync();
            clearInterval(this.intervalTime);
            clearInterval(this.intervalRest);
            return;
        }
        /* Run: stop is true
        * i CHANGE or stop be CLICKED
        * ID Current*/
        if ( ( prevProps.run.i !== this.props.run.i
            || prevProps.stop !== this.props.stop )
            && this.props.stop === true && this.props.idCurr === this.props.text.id
        ) {
                clearInterval(this.intervalRest);
                clearInterval(this.intervalTime);
                this.timeCount();
        }
    }
    componentWillUnmount() {
        clearInterval(this.intervalRest);
        clearInterval(this.intervalTime);
    }
    restTimeCount = () => {
    this.intervalRest = setInterval(() => {
        if (this.state.restTime == 0){
            clearInterval(this.intervalRest);
            /* restFinish true*/
            if( !this.props.run.restFinish ) this.nextRun();
            return;
        }
        this.setState({restTime: this.state.restTime -1 });
    },1000);
}
    timeCount = () => {
        if ( this.state.time == 0 && this.state.restTime == 0 ) {
            this.nextRun();
            return;
        }
        this.props.beginS.replayAsync();
        this.props.endS.pauseAsync();
        this.intervalTime = setInterval(() => {
            if ( this.state.time == 0 ) {
                clearInterval(this.intervalTime);
                if( this.props.run.finish == false ) {
                    /* Time run out set finish true and play endS sound*/
                    this.props.next(this.props.id, true, true);
                    this.props.beginS.pauseAsync();
                    this.props.endS.replayAsync();
                }
                /* Run rest time when time=0 */
                this.restTimeCount();
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
                        keyboardVerticalOffset = {150}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{flex: 1}}
                    >
                    <TouchableOpacity style={[styles.item]}
                                      onLongPress={this.disableTouch}>
                        <View style={styles.itemLeft}>
                            <TouchableOpacity style={[styles.square, this.props.edit ? {backgroundColor: '#ec3d64'}: null]}
                                onPress={() => props.delete(props.text.id) }>
                            </TouchableOpacity>
                            <TextInput style={styles.itemText} placeholder={'Write a task'} value={this.state.name} onChangeText={this.changeText} />
                        </View>
                        <View style={styles.time} >
                        <TextInput keyboardType={'number-pad'} style={[styles.timeC]} value={this.state.time.toString()} onChangeText={time => this.changeTime(time,'time')}/>
                        <TextInput keyboardType={'number-pad'} style={[styles.timeR]} value={this.state.restTime.toString()} onChangeText={time => this.changeTime(time,'restTime')}/>
                        </View>
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
                            onPress={() => props.delete(props.text.id) }
                            style={[styles.square, this.props.edit ? {backgroundColor: '#ec3d64'}: null]}
                        />
                        <Text style={styles.itemText}>{this.props.text.name}</Text>
                    </View>
                    <View style={styles.time}>
                        <Text style={styles.timeC}>{this.state.time}</Text>
                        <Text style={styles.timeR}>{this.state.restTime}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: 336.75,
        height: 86,
    },
    /* Square and Text */
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        left: 7.25,
    },
    square: {
        position: 'relative',
        width: 20.72,
        height: 20.72,
        borderRadius: 4.84504,
        backgroundColor: '#3f7fec',
    },
    itemText: {
        width: 240,
        maxHeight: 86,
        marginLeft: 10,
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 15.5041,
        lineHeight: 18,
        display: 'flex',
        alignItems: 'center',
        color: '#0D0D0D',
        textAlignVertical: 'center',
    },
    /* Time */
    time: {
        position: 'absolute',
        width: 47,
        height: 58,
        left: 284,
        top: 21,
        alignItems: 'center',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 16,
        lineHeight: 18,
        color: '#0D0D0D',
    },
    timeC: {
        position: 'absolute',
        color: '#1DE348',
    },
    timeR: {
        position: 'relative',
        color: 'rgba(13, 13, 13, 0.76)',
        marginTop: 28,
    },
    itemUpdating: {
        width: '100%',
        backgroundColor: '#e0d0d0',
    },
    itemNoUpdate: {
        opacity: 0.5,
    },
    circular: {
        height: 20,
        width: 20,
    },

});

export default Task;
