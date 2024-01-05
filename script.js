function visualizeGraph(matrix) {
    // Parse the matrix to create nodes and edges for the graph
    var nodes = [];
    var edges = [];
    var addedEdges = new Set(); // To track added edges

    for (let i = 0; i < matrix.length; i++) {
        nodes.push({ id: i, label: String(i) });
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === 1) {
                var edgeKey = i < j ? `${i}-${j}` : `${j}-${i}`;
                if (!addedEdges.has(edgeKey)) {
                    edges.push({ from: i, to: j });
                    addedEdges.add(edgeKey);
                }
            }
        }
    }

    // Create a network
    var container = document.getElementById('graph');
    var data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
    var options = {}; // You can customize the options as needed
    var network = new vis.Network(container, data, options);
}
function parseMatrix(input) {
    var rows = input.split('\n');
    return rows.map(row => row.trim().split(/\s+/).map(Number));
}

document.getElementById('visualize-button').addEventListener('click', function() {
    var matrixInput = document.getElementById('adjacency-matrix').value;
    var matrix = parseMatrix(matrixInput);
    visualizeGraph(matrix);

    var results = calculateLaplacianAndEigen(matrix);
    displayResults(results.laplacianMatrix, results.eigenvalues, results.eigenvectors);
});


function calculateLaplacianAndEigen(matrix) {
    // Degree matrix
    var degreeMatrix = matrix.map(function(row, i) {
        var degree = row.reduce(function(a, b) { return a + b; }, 0);
        return row.map(function(_, j) { return i === j ? degree : 0; });
    });

    // Laplacian matrix: L = D - A
    var laplacianMatrix = numeric.sub(degreeMatrix, matrix);
    // Eigenvalues and eigenvectors
    var eigen = numeric.eig(laplacianMatrix);
    var eigenvalues = eigen.lambda.x;
    var eigenvectors = eigen.E.x;

    return { laplacianMatrix, eigenvalues, eigenvectors };
}

function displayResults(laplacianMatrix, eigenvalues, eigenvectors) {
    document.getElementById('laplacian').innerHTML = 'Laplacian Matrix:<br>' + createMatrixTable(laplacianMatrix);

    //var sortedResults = sortEigenvaluesAndEigenvectors(eigenvalues, eigenvectors);
    //document.getElementById('eigenvalues').innerText = 'Eigenvalues:\n' + sortedResults.sortedEigenvalues.map(ev => roundToTwo(ev)).join(', ');
    //document.getElementById('eigenvectors').innerHTML = 'Eigenvectors:<br>' + createEigenvectorMatrix(sortedResults.sortedEigenvectors, sortedResults.sortedEigenvalues);
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

function sortEigenvaluesAndEigenvectors(eigenvalues, eigenvectors) {
    // Combine the eigenvalues and eigenvectors for sorting
    var combined = eigenvalues.map((value, index) => {
        return {value: value, vector: eigenvectors[index]};
    });

    // Sort based on the eigenvalues
    combined.sort((a, b) => a.value - b.value);

    // Separate them back out
    return {
        sortedEigenvalues: combined.map(a => a.value),
        sortedEigenvectors: combined.map(a => a.vector)
    };
}

function createEigenvectorMatrix(eigenvectors, eigenvalues) {
    let table = '<table border="1">';
    // Header row for eigenvalues
    table += '<tr class="eigenvalues-row">';
    table += `<td class="node-column"> Node </td>`;
    for (let i = 0; i < eigenvalues.length; i++) {
        table += `<td>${roundToTwo(eigenvalues[i])}</td>`;
    }
    table += '</tr>';

    // Rows for eigenvectors
    for (let i = 0; i < eigenvectors.length; i++) {
        table += '<tr>';
        table += `<td class="node-column">${i}</td>`;
        for (let j = 0; j < eigenvectors[i].length; j++) {
            table += `<td>${roundToTwo(eigenvectors[i][j])}</td>`;
        }
        table += '</tr>';
    }
    table += '</table>';
    return table;
}

