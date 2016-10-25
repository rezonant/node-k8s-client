# @rezonant/k8s: Nodejs/Typescript Kubernetes client library

Forked from [Goyoo's version](https://github.com/Goyoo/node-k8s-client/blob/master/index.ts)

Node.js client library for Google's Kubernetes Kubectl and REST API. 

# Build
``` 
    git clone https://github.com/Goyoo/node-k8s-client.git
    npm install
    npm run build
```
# Test
To test please install [minikube](https://github.com/kubernetes/minikube/releases).
```
    npm test
```

# Install:
```
    npm install @rezonant/k8s
```
# Usage

## Kubectl API

The simpler of the two APIs provided by this package is an API built upon `kubectl`. This is most useful for deployments and simple introspection, but does not offer watching and it's capabilities are limited to those of the version of kubectl you are using.

### Create client
```typescript
import { Kubectl } from '@rezonant/k8s';

// use kubectl
var kubectl = new Kubectl({
    endpoint:  'http://192.168.10.10:8080'
    , namespace: 'namespace'
    , binary: '/usr/local/bin/kubectl'
})

// Configure kubectl using kubeconfig
var kube = new Kubectl({
	binary: '/bin/kubectl'
	,kubeconfig: '/etc/cluster1.yaml'
	,version: '/api/v1'
});
```

### Options

`endpoint`
: URL for API

`version`
: API Version

`binary`
: Path to binary file

`kubeconfig`
: Path to kubeconfig

`auth`
: See below authentication section

`strictSSL`
: If set to false, use of the API will not validate SSL certificate. Defualt is true.

#### Authentication

Authentication to REST API is done via the `auth` option. Currently supported authentication method types are username/password, token and client certificate. Presence of authentication details is checked in this order so if a token is specified as well as a client certificate then a token will be used.

Username/password:

```
{
  "auth": {
    "username": "admin",
    "password": "123123"
  }
}
```

Token:

```
{
  "auth": {
    "token": "hcc927ndkcka12"
  }
}
```

Client certificate:

```
{
  "auth": {
    "clientKey": fs.readFileSync('k8s-client-key.pem'),
    "clientCert": fs.readFileSync('k8s-client-cert.pem'),
    "caCert": fs.readFileSync('k8s-ca-crt.pem')
  }
}
```

### Ways to get a response (callback, promise, async/await)
```js
    //kubectl['type']['action]([arguments], [flags], [callback]): Promise

    //callback
    kubect.pod.delete('pod_name', function(err, data){})
    kubect.pod.delete('pod_name', ['--grace-period=0'], function(err, data){})
    //promise
    kubect.pod.delete('pod_name').then()
    kubect.pod.delete('pod_name', ['--grace-period=0']).then()
    //async/await
    const data = await kubect.pod.delete('pod_name')
    const data = await kubect.pod.delete('pod_name',['--grace-period=0'])
```

### Execute a raw `kubectl` command
You can execute a raw kubectl command like so:
```js
    kubectl.command('get pod pod_name --output=json', function(err, data){})
    kubectl.command('get pod pod_name --output=json').then()
    const data = await kubectl.command('get pod pod_name --output=json')
```

## Setting namespace for multiple commands
Use withNamespace() on either `Kubectl` or `KubectlStore<T>` to create a subobject which is bound to the given namespace.
```js
    kubectl.withNamespace('someNamespace').pod.list().then(list => console.log(list))
```

## Pods

### Get a list of pods

```js
kubectl.pod.list(function(err, pods){})

//selector
var label = { name: nginx }
kubectl.pod.list(label, function(err, pods){})
```

### Get a pod by name

```js
kubectl.pod.get(podName, callback)
```

### Create a pod from a Yaml/JSON file

```js
kubectl.pod.create(fileName, callback?)
```

### Delete a pod by name

```js
kubectl.pod.delete(podName, callback?)
```

### Retrieve the logs of one or more pods

```js
kubectl.pod.log('pod1name pod2name ...', callback)
```

## ReplicationControllers

### Get a list of replication controllers

```js
kubectl.rc.list(selector, callback?)
kubectl.rc.list(callback?)
```

### Get an RC by name

```js
kubectl.rc.get(rcName, callback?)
```

### Create an RC from file

```js
kubectl.rc.create(fileName, callback?)
```

### Delete an RC by name

```js
kubectl.rc.delete(rcName, callback?)

```

### Rolling update by image name

```js
kubectl.rc.rollingUpdate(rcName, 'image:version', callback?)
```

### Rolling update from file (JSON/Yaml)

```js
kubectl.rc.rollingUpdateByFile(rcName, fileName, callback?)
```

### Scale

```js
kubectl.rc.scale(rcName, numberOfReplicas, callback)
```

## Services

### Get the list of services

```js
kubectl.service.list(selector, callback?)
kubectl.service.list(callback?)
```

### Get a service

```js
kubectl.service.get(serviceName, callback?)
```

### Create a service

```js
kubectl.service.create(fileName, callback?)
```

### Delete a service

```js
kubectl.service.delete(serviceName, callback?)
```


## Node

### Get node list

```js
kubectl.node.list(selector, callback?)
kubectl.node.list(callback?)
```

### Get a node

```js
kubectl.node.get(nodeName, callback?)
```

### Create a node

```js
kubectl.node.create(fileName, callback?)
```

### Delete a node

```js
kubectl.node.delete(nodeName, callback?)
```

### ...And all the rest

A complete list of supported API resources:
- `pod` / `po`
- `replicationcontroller` / `rc`
- `service` / `svc`
- `node` / `no`
- `namespace / ns`
- `deployment`
- `daemonset` / `ds`
- `secrets`
- `endpoint` / `ep`
- `ingress` / `ing`
- `pvc` / `persistentvolumeclaim`
- `pv` / `persistentvolume`

# Kubernetes REST API
For more advanced interaction with Kubernetes, you may use the pure REST API.
## Create client using Kubernetes REST API
```typescript
import { Api } from '@rezonant/k8s';

//use restful api
var kubeapi = new Api({
	endpoint: 'http://192.168.10.10:8080',
	version: '/api/v1'
});
```

## Usage

#### Getting responses using callbacks
```js
// method GET
kubeapi.get('namespaces/default/replicationcontrollers', function(err, data){})

// method POST
kubeapi.post('namespaces/default/replicationcontrollers', require('./rc/nginx-rc.json'), function(err, data){})

// method PUT
kubeapi.put('namespaces/default/replicationcontrollers/nginx', require('./rc/nginx-rc.json'), function(err, data){})

// method PATCH
kubeapi.patch('namespaces/default/replicationcontrollers/nginx', [{ op: 'replace', path: '/spec/replicas', value: 2 }], function(err, data){})

// method DELETE
kubeapi.delete('namespaces/default/replicationcontrollers/nginx', function(err, data){})

```
#### Getting responses using promises
```js
kubeapi.get('namespaces/default/replicationcontrollers')
    .then(data => {
        // do something useful
    })
    .catch((err) => {
        // handle errors
    })
;
```
#### Using async/await
```js
!async function()
{
    try
    {
        // method GET
        const data1 = await kubeapi.get('namespaces/default/replicationcontrollers')
        // method POST
        const data2 = await kubeapi.post('namespaces/default/replicationcontrollers', require('./rc/nginx-rc.json'))
        // method PUT
        const data3 = await kubeapi.put('namespaces/default/replicationcontrollers/nginx', require('./rc/nginx-rc.json'))
        // method PATCH
        const data4 = await kubeapi.patch('namespaces/default/replicationcontrollers/nginx', [{ op: 'replace', path: '/spec/replicas', value: 2 }])
        // method DELETE
        const data5 = await kubeapi.delete('namespaces/default/replicationcontrollers/nginx')
    }
    catch(err){
        console.log(err)
    }
}()
```

#### method GET -> watch
###### using callback
```js
var res = kubeapi.watch('watch/namespaces/default/pods', function(data){
	// message
}, function(err){
	// exit
}, [timeout])

```

###### using rxjs
```js
kubeapi.watch('watch/namespaces/default/pods', [timeout]).subscribe(data=>{
    // message
}, err=>{
    // exit
})
```
