const path = require('path');
const connection = require(path.join(path.resolve(), 'config/db.js'));

let addTask = async (req, res) => {  
    const ID = req.params.EmpID;
    const {name, Description_} = req.body;

    connection.execute(
        `INSERT INTO task (name, Description_) VALUES (?, ?)`,
        [name, Description_],
        (err, taskResult) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Failed', err });
            }

            const taskId = taskResult.insertId;

            connection.execute(
                `INSERT INTO create_task (EmpID, TaskID) VALUES (?, ?)`,
                [ID, taskId],
                (err, createTaskResult) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ message: 'Failed', err });
                    }

                    res.status(200).json({ message: "Success", taskId });
                }
            );
        }
    );
}

let getTaskByID = async(req, res) =>{
    const taskID = req.params.TaskID;
    connection.execute(`select * from task where TaskID = ?`, [taskID], (err, data) =>{
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error fetching task', error: err });
        }
        if (data && data.length > 0) {
            res.status(200).json({ message : "Success", data: data[0] });
        } else {
            res.status(404).json({ message : "Task not found" });
        }
    });
}

let getAllTasks = async(req, res) =>{
    connection.execute(`select *  from task`, (err, data) =>{
        if(data)
            res.json(200, {message : "Success", data})
        else
        res.json(500, {message : "Failed", err})
    })
    
}

let deleteTaskByID = async (req, res) => {
    const ID = req.params.EmpID;
    const taskId = req.params.TaskID;

    connection.execute(`SELECT * FROM create_task WHERE EmpID = ? AND TaskID = ?`, [ID, taskId], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to verify task creator', error: err });
        }

        if (data.length > 0) {
            connection.execute(`DELETE FROM task WHERE TaskID = ?`, [taskId], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Failed to delete task', error: err });
                }

                if (result.affectedRows > 0) {
                    res.status(200).json({ message: 'Task deleted successfully' });
                } else {
                    res.status(404).json({ message: 'Task not found' });
                }
            });
        } else {
            res.status(403).json({ message: 'You are not authorized to delete this task' });
        }
    });
};

let editTaskByID = async (req, res) => {
    const ID = req.params.EmpID;
    const taskId = req.params.TaskID;
    const { ...updateFields } = req.body;

    const allowedFields = ['name','Description_'];
    const fields = Object.keys(updateFields).filter(field => allowedFields.includes(field));
    const values = fields.map(field => updateFields[field]);

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `UPDATE task SET ${setClause} WHERE TaskID = ?`;

    connection.execute(`SELECT * FROM create_task WHERE EmpID = ? AND TaskID = ?`, [ID, taskId], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to verify task creator', error: err });
        }
        
        if (data.length > 0) {
            values.push(taskId);

            connection.execute(query, values, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Failed to update task', error: err });
                }

                res.status(200).json({ message: 'Success', affectedRows: result.affectedRows });
            });
        } else {
            res.status(403).json({ message: 'You are not authorized to update this task' });
        }
    });
};

let updateTaskStatusByID = async (req, res) => {
    const ID = req.params.EmpID;
    const taskId = req.params.TaskID;
    const { Status_ } = req.body;

    if (!Status_) {
        return res.status(400).json({ message: 'Status_ is required for updating the task status' });
    }

    const query = `UPDATE task SET Status_ = ? WHERE TaskID = ?`;

    connection.execute(`SELECT * FROM create_task WHERE EmpID = ? AND TaskID = ?`, [ID, taskId], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to verify task creator', error: err });
        }
        
        if (data.length > 0) {
            connection.execute(query, [Status_, taskId], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Failed to update task status', error: err });
                }

                res.status(200).json({ message: 'Task status updated successfully', affectedRows: result.affectedRows });
            });
        } else {
            res.status(403).json({ message: 'You are not authorized to update this task' });
        }
    });
};

module.exports = {
    addTask,
    getTaskByID,
    getAllTasks,
    deleteTaskByID,
    updateTaskStatusByID,
    editTaskByID
}