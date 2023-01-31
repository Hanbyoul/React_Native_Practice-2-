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

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLading] = useState(false);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);

  //local storage에 저장 하기
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); // JSON.stringify : 오브젝트를 string으로 바꿔준다.
  };

  //local storage에서 불러오기
  const loadToDos = async () => {
    try {
      setLading(true);
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      // JSON.parse : string을 자바스크립트 오브젝트로 변환 시켜준다
      if (s !== null) {
        setToDos(JSON.parse(s));
      }
      setLading(false);
    } catch (e) {
      setLading(false);
    }
  };

  useEffect(() => {
    loadToDos(); // Component did Mount일때 loadData 불러오기
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (id) => {
    Alert.alert("Delete To Do?", "Are you sure??", [
      { text: "Cancel" },
      {
        text: "sure",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[id];
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
        placeholder={working ? "Add a To Do" : "Where do you want to go"} //placeholder
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
                <Text style={styles.toDoText}>{toDos[toDo].text}</Text>
                <TouchableOpacity onPress={() => deleteToDo(toDo)}>
                  <Fontisto name="trash" size={24} color="black" />
                </TouchableOpacity>
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
    paddingVertical: 20,
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
  },
  loading: {
    height: "100%",

    alignItems: "center",
  },
});
