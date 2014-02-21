var container;
var geometry = new THREE.BufferGeometry();
var clock = new THREE.Clock();

var camera, scene, renderer, controls;
var phongShader = THREE.ShaderLib.phong;
var uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);
uniforms.diffuse.value.setHex(0xffffff);
uniforms.ambient.value.setHex(0xffffff);
uniforms.specular.value.setHex(0xffffff);
uniforms.time = { type: 'f', value: 1.0 };
uniforms.shininess.value = 250;
phongShader.uniforms = uniforms;


init();
animate();

function init() {

    container = document.getElementById( 'container' );

    //

    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 3500 );
    camera.position.z = 2750;
    controls = new THREE.OrbitControls( camera );
    controls.addEventListener( 'change', render );


    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

    //

    scene.add( new THREE.AmbientLight( 0x444444 ) );

    var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light1.position.set( 1, 1, 1 );
    scene.add( light1 );

    var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light2.position.set( 0, -1, 0 );
    scene.add( light2 );

    //

    var triangles = 160000;

    geometry.dynamic = true;
    geometry.addAttribute( 'index', Uint16Array, triangles * 3, 1 );
    geometry.addAttribute( 'position', Float32Array, triangles * 3, 3 );
    geometry.addAttribute( 'normal', Float32Array, triangles * 3, 3 );
    geometry.addAttribute( 'color', Float32Array, triangles * 3, 3 );

    // break geometry into
    // chunks of 21,845 triangles (3 unique vertices per triangle)
    // for indices to fit into 16 bit integer number
    // floor(2^16 / 3) = 21845

    var chunkSize = 21845;

    var indices = geometry.attributes.index.array;

    for ( var i = 0; i < indices.length; i ++ ) {

        indices[ i ] = i % ( 3 * chunkSize );

    }

    var positions = geometry.attributes.position.array;
    var normals = geometry.attributes.normal.array;
    var colors = geometry.attributes.color.array;

    var color = new THREE.Color();

    var n = 1000, n2 = n/2;  // triangles spread in the cube
    var d = 6, d2 = d/2;   // individual triangle size

    var pA = new THREE.Vector3();
    var pB = new THREE.Vector3();
    var pC = new THREE.Vector3();

    var cb = new THREE.Vector3();
    var ab = new THREE.Vector3();

    for ( var i = 0; i < positions.length; i += 9 ) {

        // positions

        var x = Math.random() * n - n2;
        var y = Math.random() * 100 - 50;
        var z = Math.random() * n - n2;

        var ax = x + Math.random() * d - d2;
        var ay = y + Math.random() * d - d2;
        var az = z + Math.random() * d - d2;

        var bx = x + Math.random() * d - d2;
        var by = y + Math.random() * d - d2;
        var bz = z + Math.random() * d - d2;

        var cx = x + Math.random() * d - d2;
        var cy = y + Math.random() * d - d2;
        var cz = z + Math.random() * d - d2;

        positions[ i ]     = ax;
        positions[ i + 1 ] = ay;
        positions[ i + 2 ] = az;

        positions[ i + 3 ] = bx;
        positions[ i + 4 ] = by;
        positions[ i + 5 ] = bz;

        positions[ i + 6 ] = cx;
        positions[ i + 7 ] = cy;
        positions[ i + 8 ] = cz;

        // flat face normals

        pA.set( ax, ay, az );
        pB.set( bx, by, bz );
        pC.set( cx, cy, cz );

        cb.subVectors( pC, pB );
        ab.subVectors( pA, pB );
        cb.cross( ab );

        cb.normalize();

        var nx = cb.x;
        var ny = cb.y;
        var nz = cb.z;

        normals[ i ]     = nx;
        normals[ i + 1 ] = ny;
        normals[ i + 2 ] = nz;

        normals[ i + 3 ] = nx;
        normals[ i + 4 ] = ny;
        normals[ i + 5 ] = nz;

        normals[ i + 6 ] = nx;
        normals[ i + 7 ] = ny;
        normals[ i + 8 ] = nz;

        // colors

        var vx = ( x / n ) + 0.5;
        var vy = ( y / n ) + 0.5;
        var vz = ( z / n ) + 1.5;

        color.setRGB( vx, vy, vz );

        colors[ i ]     = color.r;
        colors[ i + 1 ] = color.g;
        colors[ i + 2 ] = color.b;

        colors[ i + 3 ] = color.r;
        colors[ i + 4 ] = color.g;
        colors[ i + 5 ] = color.b;

        colors[ i + 6 ] = color.r;
        colors[ i + 7 ] = color.g;
        colors[ i + 8 ] = color.b;

    }
    geometry.offsets = [];
    geometry.dynamic = true;



    var offsets = triangles / chunkSize;

    for ( var i = 0; i < offsets; i ++ ) {

        var offset = {
            start: i * chunkSize * 3,
            index: i * chunkSize * 3,
            count: Math.min( triangles - ( i * chunkSize ), chunkSize ) * 3
        };

        geometry.offsets.push( offset );

    }

    geometry.computeBoundingSphere();
    /*
    * Start PhongShader stuff
    */
    var material = new THREE.ShaderMaterial({ uniforms: phongShader.uniforms, attributes: {}, fragmentShader: document.getElementById( 'fragmentShader' ).textContent, vertexShader: document.getElementById( 'vertexShader' ).textContent, side: THREE.DoubleSide, lights: true, vertexColors: THREE.VertexColors});

    /*
    * The Phong Material
    */
    // var material = new THREE.MeshPhongMaterial( {
    //         color: 0xaaaaaa, ambient: 0xaaaaaa, specular: 0xffffff, shininess: 250,
    //         side: THREE.DoubleSide, vertexColors: THREE.VertexColors, morphTargets: true
    // } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    //

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setClearColor( scene.fog.color, 1 );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    container.appendChild( renderer.domElement );

    //
    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );
    controls.update();
    render();
    geometry.attributes.position.needsUpdate = true;
}

function render() {
    var delta = clock.getDelta();

    uniforms.time.value += delta * 5;
    mesh.rotation.x = uniforms.time.value * 0.08;
    mesh.rotation.y = uniforms.time.value* 0.07;
    geometry.attributes.position.needsUpdate = true;
    geometry.computeBoundingSphere();
    renderer.render( scene, camera );

}
