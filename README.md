# Teaching-HEIGVD-RES-2016-Labo-DockerMusic

## Admin

* You can work in teams of two students.
* You should fork and clone this repo. You should also configure an `upstream` repo, to be able to pull updates that we will publish in this original repo.
* There will not be a "full" lab grade for this long lab. However, there will *at least* one point to gain for the "salami" TE grade. Also, the skills that you will learn during this lab will be necessary for subsequent labs.
* We expect that you will have more issues and questions than with other labs (because we have a left some questions open on purpose). Please ask your questions on telegram or in the forum, so that everyone in the class can benefit from the discussion.
 
## Objectives

This lab has 4 objectives:

* The first objective is to **design and implement a simple application protocol on top of UDP**. It will be very similar to the protocol presented during the lecture (where thermometers were publishing temperature events in a multicast group and where a station was listening for these events).

* The second objective is to get familiar with several tools from **the JavaScript ecosystem**. You will implement two simple **Node.js** applications. You will also have to search for and use a couple of **npm modules** (i.e. third-party libraries).

* The third objective is to get familiar with **Docker**. You will have to create 2 Docker images (they will be very similar to the images presented in the previous lecture). You will then have to run multiple containers based on these images.

* Last but not least, the fourth objective is to **work with a bit less upfront guidance**, as compared with previous labs. This time, we do not provide a complete webcast to get you started, because we want you to search for information (this is a very important skill that we will increasingly train). Don't worry, we have prepared a fairly detailed list of tasks that will put you on the right track. If you feel a bit overwhelmed at the beginning, make sure to read this document carefully and to find answers to the questions asked in the tables. You will see that the whole thing will become more and more approachable.


## Requirements

In this lab, you will **write 2 small NodeJS applications** and **package them in Docker images**:

* the first app, **Musician**, simulates someone who plays an instrument in an orchestra. When the app is started, it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). Of course, the sound depends on the instrument.

* the second app, **Auditor**, simulates someone who listens to the orchestra. This application has two responsibilities. Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. Concretely, this means that it should implement a very simple TCP-based protocol.

![image](images/joke.jpg)


### Instruments and sounds

The following table gives you the mapping between instruments and sounds. Please **use exactly the same string values** in your code, so that validation procedures can work.

| Instrument | Sound         |
|------------|---------------|
| `piano`    | `ti-ta-ti`    |
| `trumpet`  | `pouet`       |
| `flute`    | `trulu`       |
| `violin`   | `gzi-gzi`     |
| `drum`     | `boum-boum`   |

### TCP-based protocol to be implemented by the Auditor application

* The auditor should include a TCP server and accept connection requests on port 2205.
* After accepting a connection request, the auditor should send a JSON payload containing the list of active musicians, with the following format (it can be a single line, without indentation):

```
[
  {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
  },
  {
  	"uuid" : "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
  	"instrument" : "flute",
  	"activeSince" : "2016-04-27T05:39:03.211Z"
  }
]
```

### What you should be able to do at the end of the lab


You should be able to start an **Auditor** container with the following command:

```
$ docker run -d -p 2205:2205 res/auditor
```

You should be able to connect to your **Auditor** container over TCP and see that there is no active musician.

```
$ telnet IP_ADDRESS_THAT_DEPENDS_ON_YOUR_SETUP 2205
[]
```

You should then be able to start a first **Musician** container with the following command:

```
$ docker run -d res/musician piano
```

After this, you should be able to verify two points. Firstly, if you connect to the TCP interface of your **Auditor** container, you should see that there is now one active musician (you should receive a JSON array with a single element). Secondly, you should be able to use `tcpdump` to monitor the UDP datagrams generated by the **Musician** container.

You should then be able to kill the **Musician** container, wait 10 seconds and connect to the TCP interface of the **Auditor** container. You should see that there is now no active musician (empty array).

You should then be able to start several **Musician** containers with the following commands:

```
$ docker run -d res/musician piano
$ docker run -d res/musician flute
$ docker run -d res/musician flute
$ docker run -d res/musician drum
```
When you connect to the TCP interface of the **Auditor**, you should receive an array of musicians that corresponds to your commands. You should also use `tcpdump` to monitor the UDP trafic in your system.


## Task 1: design the application architecture and protocols

| #  | Topic |
| --- | --- |
|Question | How can we represent the system in an **architecture diagram**, which gives information both about the Docker containers, the communication protocols and the commands? |
| | ![diagram](images/DockerMusicDiagram.png)<br>To run the docker images in containers, do `$ docker run -p 2205:2205 res/auditor` (here, image is `res/auditor` and local/distant port are both 2205). |
|Question | Who is going to **send UDP datagrams** and **when**? |
| | The musicians, every second. |
|Question | Who is going to **listen for UDP datagrams** and what should happen when a datagram is received? |
| | The Auditor will wait for it. Once received, it will add it to the list of active musicians. |
|Question | What **payload** should we put in the UDP datagrams? |
| | The sound played by the musician. |
|Question | What **data structures** do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures? |
| | In the server, we should have a list containing every musician that is active. In the client, we should have its UUID. |


## Task 2: implement a "musician" Node.js application

| #  | Topic
| ---  | ---
|Question | In a JavaScript program, if we have an object, how can we **serialize it in JSON**?
| | For an object o, `JSON.stringify(o)`. |
|Question | What is **npm**? |
| | The packet manager of Node.js. Allows for example installing and updating packages. |
|Question | What is the `npm install` command and what is the purpose of the `--save` flag? |
| | Install the package given as argument. The `--save` flag allows to add the package to the list of dependencies in `package.json`.|
|Question | How can we use the `https://www.npmjs.com/` web site? |
| | Various info can be found to a package by inputing its name in the search field. |
|Question | In JavaScript, how can we **generate a UUID** compliant with RFC4122? |
| | We can use the `uuid` package since it generates RFC4122 UUIDS. |
|Question | In Node.js, how can we execute a function on a **periodic** basis? |
| | Using the `setInterval` function. Takes the function to call and the time interval between each call, as milliseconds. |
|Question | In Node.js, how can we **emit UDP datagrams**? |
| | By first creating a socket using the `createSocket` function defined in the `dgram` module and giving it the wanted protocol : `dgram.createSocket("udp4")`. We must then call the `send` function on the created socket.  |
|Question | In Node.js, how can we **access the command line arguments**? |
| | By reading the `argv` field (an array) of the `process` object. The first element is 'node', the second the name of the JavaScript file and the next elements are the additional command line arguments. |


## Task 3: package the "musician" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we **define and build our own Docker image**? |
| | 1. Create a docker file.<br>2. Open it and add `$ FROM ${IMAGE}`, with as image the image the docker will be based on. <br>3. Add various statements as needed.<br>4. Open a terminal, go to the folder containing the docker file and type `$ docker build -t ${IMAGE_TAG} ${PATH_TO_DOCKERFILE_DIRECTORY}` will create the docker image from the docker file in the current directory and build it into the destination directory with the given tag.|
|Question | How can we use the `ENTRYPOINT` statement in our Dockerfile? |
| | The ENTRYPOINT defines what will be ran when the image is run. `ENTRYPOINT ["node", "index.js"]` will run "node" with "index.js".
|Question | After building our Docker image, how do we use it to **run containers**?
| | `$ docker run ${IMAGE}`. |
|Question | How do we get the list of all **running containers**?
| | `$ docker ps`. |
|Question | How do we **stop/kill** one running container?
| | `$ docker kill ${CONTAINER}`. |
|Question | How can we check that our running containers are effectively sending UDP datagrams?
| | `$ tcpdump -i ${INTERFACE}`. If there is something printed periodically, it works. |


## Task 4: implement an "auditor" Node.js application

| #  | Topic |
| ---  | --- |
|Question | With Node.js, how can we listen for UDP datagrams in a multicast group? |
| | We must first create the socket using `createSocket` from the `dgram` module with `udp4`as parameter.  |
|Question | How can we use the `Map` built-in object introduced in ECMAScript 6 to implement a **dictionary**? |
| | A dictionary works with keys and values, exactly as the Map. When the Map is created, we can use the set and get methods to respectively add/modify elements or fetch them, using anything as key and anything as value. |
|Question | How can we use the `Moment.js` npm module to help us with **date manipulations** and formatting? |
| | `Moment.js` allows us to easily format dates and get the difference between a given time and current time as seconds with `moment().diff(${DATE}, 'seconds')`  |
|Question | When and how do we **get rid of inactive players**? |
| | We get rid of inactive players when the don't play any sound for 5 seconds. In order to do this, we can periodically compare the last time they played with the current time and remove them if needed. |
|Question | How do I implement a **simple TCP server** in Node.js? |
| | By calling the `createServer` function of the `net` module. We can pass to this function a callback used when a new connection is established.  |


## Task 5: package the "auditor" app in a Docker image

| #  | Topic|
| ---  | --- |
|Question | How do we validate that the whole system works, once we have built our Docker image? |
| | We simply run our docker images: the auditor first and the musician next, providing the name of the instrument. Then we establish a connection with the auditor (with telnet for example) and see if the musician is active. We can kill the musician, connect again later to the auditor and notice that there isn't any musician playing. |


## Constraints

Please be careful to adhere to the specifications in this document, and in particular

* the Docker image names
* the names of instruments and their sounds
* the TCP PORT number

Also, we have prepared two directories, where you should place your two `Dockerfile` with their dependent files.

Have a look at the `validate.sh` script located in the top-level directory. This script automates part of the validation process for your implementation (it will gradually be expanded with additional operations and assertions). As soon as you start creating your Docker images (i.e. creating your Dockerfiles), you should try to run it.


## Schedule

| Date | AM/PM | Activity
| :--: | :---: | --------
|27.04.2016 | AM | Orientation and requirements; activity 1.
|27.04.2016 | PM | Activity 2
|04.05.2016 | AM | We will ask some students to **do a demo** of what they have achieved so far. You should be ready to start a Musician Docker container and prove that UDP datagrams are emitted. We will also have a **guest speaker** during the morning session.
|04.05.2016 | PM | Activities 3 and 4
|11.05.2016 | AM | There will be a **written test** on everything that we have studied so far (travail écrit).
|11.05.2016 | PM | Validation and demonstrations.

