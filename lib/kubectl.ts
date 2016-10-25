
import { spawn } from 'child_process';
import * as _ from 'underscore';
import * as fs from 'fs';

import { Pod, ReplicationController, Deployment, Ingress, 
	     DaemonSet, Service, Namespace, Secret, Endpoint, List, PersistentVolumeClaim, PersistentVolume } from './k8s-api';

export type Callback<T> = (err : any, data : T[]) => void;

export class KubectlStore<T>
{
    private type
    private binary
    private kubeconfig
    private namespace
    private endpoint

    constructor(type, conf)
    {
		this.config = conf;
        this.type = type
        this.binary = conf.binary || 'kubectl'
        this.kubeconfig = conf.kubeconfig || ''
        this.namespace = conf.namespace || ''
        this.endpoint = conf.endpoint || ''
    }

	private config;

	private withNamespace(ns): KubectlStore<T> {
		let config = Object.create(this.config);
		config.namespace = ns;
		return new KubectlStore<T>(this.type, config);
	}

    private spawn(args, done)
    {
        const ops = new Array()

        if( this.kubeconfig ){
            ops.push('--kubeconfig='+this.kubeconfig)
        }
        else if (this.endpoint) {
            ops.push('-s')
            ops.push(this.endpoint)
        }
        
        if (this.namespace) {
            ops.push('--namespace='+this.namespace)
        }

        const kube = spawn(this.binary, ops.concat(args))
            , stdout = []
            , stderr = []
        
        kube.stdout.on('data', function (data) {
            stdout.push(data.toString())
        })
        
        kube.stderr.on('data', function (data) {
            stderr.push(data.toString())
        })
        
        kube.on('close', function (code) 
        {
			if (code == 0)
                return done(null, stdout.join(''))

            done(stderr.join(''))
        })
    }

    private callbackFunction(primise, callback)
    {
        if( _.isFunction(callback) )
        {
            primise.then(data=>{
                callback(null, data)
            }).catch(err=>{
                callback(err)
            })
        }
    }

    public command(cmd : string, callback? : Callback<any>): Promise<any>;
    public command(cmd : string[], callback? : Callback<any>): Promise<any>;
    public command(cmd : any, callback? : Callback<any>): Promise<any>
    {
        if( _.isString(cmd) )
            cmd = (<any>cmd).split(' ')
 
        const promise = new Promise((resolve, reject) => 
        {
            this.spawn(cmd, function(err, data)
            {
                if( err )
                    return reject(err || data)
                
                resolve(cmd.join(' ').indexOf('--output=json') > -1 ? JSON.parse(data): data)
            })
        })
        
        this.callbackFunction(promise, callback)
        
        return promise
    }

    public list(selector?, flags?, done? : Callback<T[]>) : Promise<List<T>>
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( typeof selector === 'object')
        {
            var args = '--selector='
            
            for( var key in selector )
                args += (key + '=' + selector[key])
            
            selector = args + ''
        }
        else{
            done = selector
            selector = '--output=json'
        }

        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        
        const action = ['get', this.type , selector, '--output=json'].concat(flags)

        return this.command(action, done)
    }

    public get(name: string, flags?, done? : Callback<T>) : Promise<T>
    {
        if( !this.type )
            throw new Error('not a function')
         
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action = ['get', this.type, name, '--output=json'].concat(flags)

        return this.command(action, done)
        
    }

    public create(filepath: string, flags?, done? : Callback<T>) : Promise<T>
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action = ['create', '-f', filepath].concat(flags)

        return this.command(action, done)
    }

    public delete(id: string, flags, done?: Callback<void>) : Promise<void> 
    {
        if( !this.type )
            throw new Error('not a function')
            
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action = ['delete', this.type, id].concat(flags)

        return this.command(action, done)
    }

    public update(filepath: string, flags?, done?: Callback<T>) : Promise<T>
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action = ['update', '-f', filepath].concat(flags)

        return this.command(action, done)
    }

    public apply(filename : string, flags?, done?: Callback<T>) : Promise<T>
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action = ['apply', '-f', filename].concat(flags)

        return this.command(action, done)
    }

    public patch(name: string, json: Object, flags?, done?: Callback<T>) : Promise<T>
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action = ['patch',  this.type, name, '--patch='+ JSON.stringify(json)].concat(flags)

        return this.command(action, done)
    }

    public describe(name: string, flags?, done?: Callback<T>) : Promise<T>
    {
        if( !this.type )
            throw new Error('not a function')

        var action = new Array('describe', this.type)

        if ( name === null ) {
            action.push(name)
        }

        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        return this.command(action.concat(flags), done)
    }

    public portForward(name: string, portString: string, done?: Callback<void>) : Promise<void>
    {
        if( this.type !== 'pods' )
            throw new Error('not a function')

        var action = new Array('port-forward', name, portString)

        return this.command(action, done)
    }

    public useContext(context: string, done?: Callback<void>) : Promise<void>
    {
        var action = new Array('config', 'use-context', context)
        
        return this.command(action, done)
    }

    public viewContext(done?: Callback<void>)
    {
        var action = new Array('config', '--output=json', 'view')
        
        this.command(action, done)
    }
}

export interface Config {
	endpoint? : string;
	namespace? : string;
	binary? : string;
	kubeconfig? : string;
	version? : string;
}

export class KubectlPodStore extends KubectlStore<Pod> {

    public logs(name: string, flags?, done?: (err, data)=>void)
    {
        var action = new Array('logs')

        if (name.indexOf(' ') > -1) {
            var names = name.split(/ /)
            action.push(names[0])
            action.push(names[1])
        } else {
            action.push(name)
        }

        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        return this.command(action.concat(flags), done)
    }
}

export class KubectlRcStore extends KubectlStore<ReplicationController>
{
    public rollingUpdateByFile(name: string, filepath: string, flags?, done?: (err, data)=>void)
    {   
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action = ['rolling-update',  name, '-f', filepath, '--update-period=0s'].concat(flags)

        return this.command(action, done)
    }


    public rollingUpdate(name: string, image: string, flags?, done?: (err, data)=>void)
    {
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action = ['rolling-update',  name, '--image=' + image, '--update-period=0s'].concat(flags)

        return this.command(action, done)
    }

    public scale(name: string, replicas: string, flags?, done?: (err, data)=>void)
    {
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action = ['scale', '--replicas=' + replicas, 'replicationcontrollers', name].concat(flags)

        return this.command(action, done)
    }
	
}

export class KubectlDeploymentStore extends KubectlStore<Deployment> {
    public scale(name: string, replicas: string, flags?, done?: (err, data)=>void)
    {
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action = ['scale', '--replicas=' + replicas, 'replicationcontrollers', name].concat(flags)

        return this.command(action, done)
    }
}

export class Kubectl {
	constructor(private config : Config) {

		this.pod = new KubectlStore<Pod>('pods', config);
		this.po = new KubectlStore<Pod>('pods', config);
		this.replicationcontroller = new KubectlStore<ReplicationController>('replicationcontrollers', config);
		this.rc = new KubectlStore<ReplicationController>('replicationcontrollers', config);
		this.service = new KubectlStore<Service>('services', config);
		this.svc = new KubectlStore<Service>('services', config);
		this.node = new KubectlStore<Node>('nodes', config);
		this.no = new KubectlStore<Node>('nodes', config);
		this.namespace = new KubectlStore<Namespace>('namespaces', config);
		this.ns = new KubectlStore<Namespace>('namespaces', config);
		this.deployment = new KubectlStore<Deployment>('deployments', config);
		this.daemonset = new KubectlStore<DaemonSet>('daemonsets', config);
		this.ds = new KubectlStore<DaemonSet>('daemonsets', config);
		this.secrets = new KubectlStore<Secret>('secrets', config);
		this.endpoint = new KubectlStore<Endpoint>('endpoints', config);
		this.ep = new KubectlStore<Endpoint>('endpoints', config);
		this.ingress = new KubectlStore<Ingress>('ingress', config);
		this.ing = new KubectlStore<Ingress>('ingress', config);
		this.pvc = new KubectlStore<PersistentVolumeClaim>('pvc', config);
		this.persistentvolumeclaim = new KubectlStore<PersistentVolumeClaim>('pvc', config);
		this.pv = new KubectlStore<PersistentVolume>('pv', config);
		this.persistentvolume = new KubectlStore<PersistentVolume>('pv', config);
	}

	public withNamespace(ns : string) : Kubectl {
		let config = Object.create(this.config);
		config.namespace = ns;
		return new Kubectl(config);
	}

	pod : KubectlStore<Pod>;
	po : KubectlStore<Pod>;
	replicationcontroller : KubectlStore<ReplicationController>;
	rc : KubectlStore<ReplicationController>;
	service : KubectlStore<Service>;
	svc : KubectlStore<Service>;
	node : KubectlStore<Node>;
	no : KubectlStore<Node>;
	namespace : KubectlStore<Namespace>;
	ns : KubectlStore<Namespace>;
	deployment : KubectlStore<Deployment>;
	daemonset : KubectlStore<DaemonSet>;
	ds : KubectlStore<DaemonSet>;
	secrets : KubectlStore<Secret>;
	endpoint : KubectlStore<Endpoint>;
	ep : KubectlStore<Endpoint>;
	ingress : KubectlStore<Ingress>;
	ing : KubectlStore<Ingress>;

	pvc : KubectlStore<PersistentVolumeClaim>;
	persistentvolumeclaim : KubectlStore<PersistentVolumeClaim>;

	pv : KubectlStore<PersistentVolume>;
	persistentvolume : KubectlStore<PersistentVolume>; 

    public command(cmd : string, callback? : Callback<any>): Promise<any>;
    public command(cmd : string[], callback? : Callback<any>): Promise<any>;
	command(cmd : any, callback? : Callback<any>): Promise<any> {
		arguments[0] = arguments[0].split(' ')
		return this.pod.command.apply(this.pod, arguments)
	}

	/**
	 * Configure kubectl to discover the current cluster using the secrets 
	 * kubernetes conveniently places in containers. Warning: this applies to
	 * all kubectl invocations until the kubectl context is changed.
	 */
	public static connectToCurrentCluster(config : Config): Kubectl {

		let kube = new Kubectl(config);

		var kubeEndpoint = `https://kubernetes`;
		var kubeToken = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/token");

		kube.command('config set-cluster local --server=https://kubernetes --certificate-authority=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt');
		kube.command(`config set-context local --cluster=local --namespace=${config.namespace || 'production'}`); 
		kube.command(`config set-credentials local --token=${kubeToken}`);

		return kube;
	}

}
