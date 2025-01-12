var globalEigenvectors
var globalEigenvalues
var originalMatrix
// Global variables
var network, nodes;

function visualizeGraph(matrix) {
    originalMatrix = matrix
    // Initialize the global nodes variable
    nodes = new vis.DataSet([]);

    var edges = new vis.DataSet([]);
    var addedEdges = new Set(); // To track added edges

    for (let i = 0; i < matrix.length; i++) {
        nodes.add({ id: i, label: String(i) });
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] !== 0) {
                var edgeKey = i < j ? `${i}-${j}` : `${j}-${i}`;
                if (!addedEdges.has(edgeKey)) {
                    edges.add({ from: i, to: j });
                    addedEdges.add(edgeKey);
                }
            }
        }
    }

    // Create a network
    var container = document.getElementById('graph');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {}; // Customize options as needed
    network = new vis.Network(container, data, options);
}

function reconstructAdjacencyMatrix(eigenvalues, eigenvectors) {
    // Reconstruct Laplacian: L = Q Lambda Q^-1
    var Q = constructEigenvectorMatrix(eigenvectors)
    var Lambda = numeric.diag(eigenvalues);
    var QInverse = numeric.inv(Q);
    var L = numeric.dot(Q, numeric.dot(Lambda, QInverse));

    // Estimate Degree Matrix (D): Sum along rows of L
    var D = L.map(row => row.reduce((a, b) => a + b, 0))
             .map((sum, index) => {
                 var degreeRow = new Array(L.length).fill(0);
                 degreeRow[index] = sum;
                 return degreeRow;
             });

    // Approximate Adjacency Matrix: A = D - L
    var A = numeric.sub(D, L);

    // Round off the elements in A to get 0 or 1
    return A.map(row => row.map(value => roundToTwo(value)));
}
function constructEigenvectorMatrix(eigenvectors) {
    var Q = [];
    for (let i = 0; i < eigenvectors[0].length; i++) { // Iterate over each element in an eigenvector
        Q.push([]);
        for (let j = 0; j < eigenvectors.length; j++) { // Iterate over each eigenvector
            Q[i].push(eigenvectors[i][j]);
        }
    }
    return Q;
}

function displayReconstructedMatrix(reconstructedMatrix, originalMatrix) {
    let table = '<table border="1">';
    
    for (let i = 0; i < reconstructedMatrix.length; i++) {
        table += '<tr>';
        for (let j = 0; j < reconstructedMatrix[i].length; j++) {
            let cellValue = reconstructedMatrix[i][j];
            let originalValue = originalMatrix[i][j];
            let cellColor = Math.abs(cellValue - originalValue) <= 0.1 ? 'white' : 'red'; // Highlight differences in red
            table += `<td style="background-color:${cellColor}">${cellValue}</td>`;
        }
        table += '</tr>';
    }

    table += '</table>';
    document.getElementById('reconstructed-matrix-content').innerHTML = table;
}

function parseMatrix(input) {
    var rows = input.split('\n');
    return rows.map(row => row.trim().split(/\s+/).map(Number));
}

document.getElementById('visualize-button').addEventListener('click', function () {
    var matrixInput = document.getElementById('adjacency-matrix').value;
    var matrix = parseMatrix(matrixInput);
    visualizeGraph(matrix);

    var results = calculateLaplacianAndEigen(matrix);
    displayResults(results.laplacianMatrix, results.eigenvalues, results.eigenvectors);
});

document.getElementById('reconstruct-button').addEventListener('click', function() {
    var reconstructedMatrix = reconstructAdjacencyMatrix(globalEigenvalues, globalEigenvectors);
    displayReconstructedMatrix(reconstructedMatrix, originalMatrix);
});

document.getElementById('graph-small-button').addEventListener('click', function() {
    document.getElementById('adjacency-matrix').value = "0 1 1 0 1 \n1 0 0 0 0 \n1 0 0 1 0 \n0 0 1 0 0 \n1 0 0 0 0"
});

document.getElementById('graph-cluster-button').addEventListener('click', function() {
    document.getElementById('adjacency-matrix').value = "0 1 1 0 1 0 0 0 0 0 0 0 0 0 \n1 0 0 0 0 0 0 0 0 0 0 0 0 0 \n1 0 0 1 0 0 0 0 0 0 0 0 0 0 \n0 0 1 0 0 0 0 0 0 0 0 0 0 0 \n1 0 0 0 0 1 0 0 0 0 0 0 0 0 \n0 0 0 0 1 0 1 1 0 1 0 0 0 0 \n0 0 0 0 0 1 0 0 0 0 0 0 0 0 \n0 0 0 0 0 1 0 0 1 0 0 0 0 0 \n0 0 0 0 0 0 0 1 0 0 0 0 0 0 \n0 0 0 0 0 1 0 0 0 0 0 0 0 0 \n0 0 0 0 0 0 0 0 0 0 0 1 0 1 \n0 0 0 0 0 0 0 0 0 0 1 0 1 0 \n0 0 0 0 0 0 0 0 0 0 0 1 0 1 \n0 0 0 0 0 0 0 0 0 0 1 0 1 0"
});

document.getElementById('graph-large-button').addEventListener('click', function() {
    document.getElementById('adjacency-matrix').value = "0 1 1 0 1 0 0 0 0 0 0 0 0 0 \n1 0 0 0 0 0 0 0 0 0 0 0 0 0 \n1 0 0 1 0 0 0 0 0 0 0 0 0 0 \n0 0 1 0 0 0 0 0 0 0 0 0 0 0 \n1 0 0 0 0 1 0 0 0 0 0 0 0 0 \n0 0 0 0 1 0 1 1 0 1 0 0 0 0 \n0 0 0 0 0 1 0 0 0 0 0 0 0 0 \n0 0 0 0 0 1 0 0 1 0 0 0 0 0 \n0 0 0 0 0 0 0 1 0 0 0 0 0 0 \n0 0 0 0 0 1 0 0 0 0 1 0 0 0 \n0 0 0 0 0 0 0 0 0 1 0 1 0 1 \n0 0 0 0 0 0 0 0 0 0 1 0 1 0 \n0 0 0 0 0 0 0 0 0 0 0 1 0 1 \n0 0 0 0 0 0 0 0 0 0 1 0 1 0"
});

document.getElementById('graph-weighted-button').addEventListener('click', function() {
    document.getElementById('adjacency-matrix').value = "1.4142135623730951 36.16626080727023 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 36.16626080727023 0.0 0.0 36.16626080727023 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n36.16626080727023 0.0 0.029411759364644564 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.029411759364644564 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.05502921237579957 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.22329074039488 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.22329074039488 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.05502921237579957 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.05502921237579957 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.05502921237579957 0.0 0.05502921237579957 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.05502921237579957 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.06420074777176617 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n36.16626080727023 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.008834851701892393 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.008834851701892393 0.0 0.02755878561227329 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.02755878561227329 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n36.16626080727023 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.01760139397034655 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.01760139397034655 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.08123337440228079 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.0 0.025738590672440737 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.025738590672440737 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.03813010018983724 0.0 0.0 0.025738590672440737 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 \n0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.025738590672440737 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0"
});

function calculateLaplacianAndEigen(matrix) {
    // Degree matrix
    var degreeMatrix = matrix.map(function (row, i) {
        var degree = row.reduce(function (a, b) { return a + b; }, 0);
        return row.map(function (_, j) { return i === j ? degree : 0; });
    });

    // Laplacian matrix: L = D - A
    var laplacianMatrix = numeric.sub(degreeMatrix, matrix);
    // Eigenvalues and eigenvectors
    var eigen = numeric.eig(laplacianMatrix);
    var eigenvalues = eigen.lambda.x;
    var eigenvectors = eigen.E.x;
    globalEigenvectors = eigenvectors
    globalEigenvalues = eigenvalues
    return { laplacianMatrix, eigenvalues, eigenvectors };
}

function displayResults(laplacianMatrix, eigenvalues, eigenvectors) {
    document.getElementById('laplacian').innerHTML = 'Laplacian Matrix:<br>' + createMatrixTable(laplacianMatrix);
    document.getElementById('eigenvalues').innerText = 'Eigenvalues:\n' + eigenvalues.map(ev => roundToTwo(ev)).join(', ');
    document.getElementById('eigenvectors').innerHTML = 'Eigenvectors:<br>' + createEigenvectorMatrix(eigenvectors, eigenvalues);
}


function roundToTwo(num) {
    return Number(num.toFixed(2));
}

function createMatrixTable(matrix) {
    let table = '<table border="1">';
    for (let i = 0; i < matrix.length; i++) {
        table += '<tr>';
        for (let j = 0; j < matrix[i].length; j++) {
            table += `<td>${roundToTwo(matrix[i][j])}</td>`;
        }
        table += '</tr>';
    }
    table += '</table>';
    return table;
}


function createEigenvectorMatrix(eigenvectors, eigenvalues) {
    let table = '<table border="1">';
    // Header row for eigenvalues
    table += '<tr class="eigenvalues-row">';
    table += `<td class="node-column"> Node </td>`;
    for (let i = 0; i < eigenvalues.length; i++) {
        table += `<td><button onclick="highlightEigenvector(${i})">${roundToTwo(eigenvalues[i])}</button></td>`;
    }
    table += '</tr>';

    // Rows for eigenvectors
    for (let i = 0; i < eigenvectors.length; i++) {
        table += '<tr>';
        table += `<td class="node-column">${i}</td>`;
        for (let j = 0; j < eigenvectors[i].length; j++) {
            table += `<td id="cell-${j}-${i}">${roundToTwo(eigenvectors[i][j])}</td>`;
        }
        table += '</tr>';
    }
    table += '</table>';
    return table;
}

function highlightEigenvector(index) {
    // Remove highlighting from all cells
    var cells = document.querySelectorAll('#eigenvectors td');
    cells.forEach(cell => cell.style.backgroundColor = '');

    // Highlight the selected column
    for (let i = 0; i < globalEigenvectors.length; i++) {
        var cell = document.getElementById(`cell-${index}-${i}`);
        if (cell) {
            cell.style.backgroundColor = 'yellow'; // Choose your preferred highlight color
        }
    }

    // Update the graph with eigenvector values and colors
    updateGraphWithEigenvector(index);
}

function updateGraphWithEigenvector(index) {
    var eigenvector = globalEigenvectors.map(function(value) { return value[index]; });
    var normalizedEigenvector = normalizeValues(eigenvector);

    eigenvector.forEach((value, i) => {
        var color = getColorForValue(value, normalizedEigenvector);
        nodes.update({ id: i, label: `Node ${i}\n${roundToTwo(value)}`, color: { background: color, border: color } });
    });

    network.redraw();
}


function getColorForValue(value, normalizedValues) {
    var normalizedValue = (value - Math.min(...normalizedValues)) / (Math.max(...normalizedValues) - Math.min(...normalizedValues));
    var hue = 240 - (normalizedValue * 240);
    return `hsl(${hue}, 100%, 50%)`;
}

function normalizeValues(values) {
    var min = Math.min(...values);
    var max = Math.max(...values);
    var range = max - min;
    return values.map(value => (value - min) / range);
}

