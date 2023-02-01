import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { theme } from "./color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";

const TO_DO_KEY = "@toDos";
const WORK_KEY = "@work";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [modiText, setModiText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLading] = useState(false);

  const travel = () => {
    setWorking(false);
    saveWork(false);
  };
  const work = () => {
    setWorking(true);
    saveWork(true);
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeModiText = (payload) => setModiText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(TO_DO_KEY, JSON.stringify(toSave));
  };

  const saveWork = async (lastWork) => {
    await AsyncStorage.setItem(WORK_KEY, JSON.stringify(lastWork));
  };

  const loadToDos = async () => {
    try {
      setLading(true);
      const loadToDo = await AsyncStorage.getItem(TO_DO_KEY);
      const loadWork = await AsyncStorage.getItem(WORK_KEY);

      if (loadToDo !== null) {
        setToDos(JSON.parse(loadToDo));
        setWorking(JSON.parse(loadWork));
      }
      setLading(false);
    } catch (e) {
      setLading(false);
    }
  };

  useEffect(() => {
    loadToDos();
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, complete: false, modify: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const modifyToDoText = async (toDo) => {
    if (modiText === "") {
      return;
    }
    const newToDos = { ...toDos };
    newToDos[toDo].text = modiText;
    newToDos[toDo].modify = !newToDos[toDo].modify;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setModiText("");
  };

  const completedToDo = async (toDo) => {
    const newToDos = { ...toDos };
    newToDos[toDo].complete = !newToDos[toDo].complete;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const modifyToDo = async (toDo) => {
    const newToDos = { ...toDos };
    newToDos[toDo].modify = !newToDos[toDo].modify;
    setToDos(newToDos);
  };

  const deleteToDo = (toDo) => {
    Alert.alert("Delete To Do?", "Are you sure??", [
      { text: "Cancel" },
      {
        text: "sure",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[toDo];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btxText, color: working ? "white" : theme.grey }}
          >
            work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btxText,
              color: !working ? "white" : theme.grey,
            }}
          >
            travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go"}
        style={styles.input}
      />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            color={"grey"}
            size="large"
            style={{ marginTop: 200 }}
          />
        </View>
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((toDo) =>
            toDos[toDo].working === working ? (
              <View style={styles.toDo} key={toDo}>
                <TouchableOpacity onPress={() => completedToDo(toDo)}>
                  <AntDesign
                    name={toDos[toDo].complete ? "checksquare" : "checksquareo"}
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
                {toDos[toDo].modify ? (
                  <TextInput
                    style={styles.modifyText}
                    onSubmitEditing={() => modifyToDoText(toDo)}
                    onChangeText={onChangeModiText}
                    value={modiText}
                    placeholder="modify text"
                  />
                ) : (
                  <Text
                    style={
                      toDos[toDo].complete
                        ? styles.toDoComplete
                        : styles.toDoText
                    }
                  >
                    {toDos[toDo].text}
                  </Text>
                )}
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    disabled={toDos[toDo].complete}
                    style={{ marginRight: 15 }}
                    onPress={() => modifyToDo(toDo)}
                  >
                    <Foundation
                      name="clipboard-pencil"
                      size={24}
                      color={toDos[toDo].complete ? "black" : "white"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDo(toDo)}>
                    <Fontisto
                      name="trash"
                      size={24}
                      color={toDos[toDo].complete ? "#54211d" : "red"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    marginTop: 100,
    flexDirection: "row",
  },
  btxText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    position: "absolute",
    left: 90,
  },
  toDoComplete: {
    color: "grey",
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "line-through",
    position: "absolute",
    left: 90,
  },
  loading: {
    height: "100%",
    alignItems: "center",
  },
  modifyText: {
    backgroundColor: "white",
    width: "60%",

    paddingHorizontal: 20,
    borderRadius: 15,
  },
});
