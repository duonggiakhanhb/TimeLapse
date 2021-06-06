import React, {Component} from 'react';
import AppMain from './src/component/App';
import {ImageBackground, View, StyleSheet} from "react-native";
class App extends Component {
    state = {
        loading: true,
    }

   async componentDidMount(){
        setTimeout(() => {
            this.setState({loading: false});
        }, 2500);
   }

    render() {
        if (this.state.loading){
            return (
                <View style={styles.container} >
                    <ImageBackground source={require("./src/component/data/image/background/backgroundLoading.png")}
                                     style={styles.background}
                    >
                    </ImageBackground>
                </View>
            )
        }
        return <AppMain />
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
});

export default App;