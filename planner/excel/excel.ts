import Excel from 'exceljs';
import {Schedule} from "../types/output/Schedule";

export const exportExecutionPlan = async (log: Schedule) => {
    const workbook = new Excel.Workbook();

    let resources = log.resources;
    let workSpaces = log.instances;
    let scheduledActions = log.scheduledActions;

    //sorts actions by start date
    scheduledActions = scheduledActions.filter(action => action.activity.duration > 0).sort((action1, action2) => {
        return action1.start - action2.start;
    });

    //get deadline(=highest end number of all actions)
    let deadline = Math.max(...scheduledActions.map(o => o.end));

    //Execution Plan (work places)
    const worksheet1 = workbook.addWorksheet('Execution Plan (work places)');
    worksheet1.getCell(1, 1).value = 'Work place';

    //creates the time axis: first creates array with all numbers from 1 up to deadline, then writes the time units (1,...,deadline) as headers in the sheet
    let columnHeaders: Array<number> = [];
    for (let index = 0; index <= deadline; index++) {
        columnHeaders.push(index);
    }

    columnHeaders.forEach((value, index) => {
        worksheet1.getCell(1, index + 2).value = value;
        worksheet1.getCell(1, index + 2).alignment = {vertical: 'middle', horizontal: 'left'};
    });

    //writes work spaces in first column
    workSpaces.forEach((value, index) => {
        worksheet1.getCell(index + 2, 1).value = value.dataclass.name + ' ' + value.name;
    });

    //loops through all actions and fills excel sheet
    for (let i = 0; i < scheduledActions.length; i++) {
        let currentAction = scheduledActions[i]

        //gets row (work space) in which action has to be written
        for (let i = 0; i < currentAction.outputList.length; i++) {
            const workSpaceForActivity = currentAction.outputList[i].dataclass.name + ' ' + currentAction.outputList[i].name;
            let rowIndex = null;
            worksheet1.eachRow((row, rowNumber) => {
                if (row.getCell(1).value === workSpaceForActivity) {
                    rowIndex = rowNumber;
                    return false;
                }
            });

            //writes activity and further information in cells depending on start and end date
            if (rowIndex !== null) {
                const startColumn = currentAction.start + 2;
                const endColumn = currentAction.end + 1;
                worksheet1.mergeCells(rowIndex, startColumn, rowIndex, endColumn)
                if (currentAction.resource) {
                    worksheet1.getCell(rowIndex, startColumn).value = currentAction.resource?.name + ' (' + currentAction.capacity + ')' + ': ' + currentAction.activity.name;
                } else {
                    worksheet1.getCell(rowIndex, startColumn).value = currentAction.activity.name;
                }

                worksheet1.getCell(rowIndex, startColumn).border = {
                    top: {style: 'thin'},
                    left: {style: 'thin'},
                    bottom: {style: 'thin'},
                    right: {style: 'thin'}
                }

                worksheet1.getCell(rowIndex, startColumn).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'E0E0E0'},
                };

                worksheet1.getCell(rowIndex, startColumn).alignment = {vertical: 'middle', horizontal: 'center'};
            }
        }
    }

    //styling
    worksheet1.columns.forEach(it => {
        it.border = {
            left: {style: "thick"}
        }
    });
    worksheet1.getRow(1).border = {
        bottom: {style: "thick"}
    };
    worksheet1.getCell(1, 1).border = {
        right: {style: "thick"},
        bottom: {style: "thick"}
    };
    worksheet1.getRow(1).font = {size: 14, bold: true};
    worksheet1.getColumn(1).font = {size: 14, bold: true};


    //Execution Plan (resources)
    const worksheet2 = workbook.addWorksheet('Execution Plan (resources)');

    worksheet2.getCell(1, 1).value = 'Resource';
    //creates the time axis: first creates array with all numbers from 1 up to deadline, then writes the time units (1,...,deadline) as headers in the sheet
    let headers: Array<number> = [];
    for (let index = 0; index <= deadline; index++) {
        headers.push(index);
    }

    headers.forEach((value, index) => {
        worksheet2.getCell(1, index + 2).value = value;
        worksheet2.getCell(1, index + 2).alignment = {vertical: 'middle', horizontal: 'left'};
    });

    //writes resources in first column
    let index = 2;
    resources.forEach((value) => {
        for(let i = 0; i < value.capacity; i++){
            worksheet2.getCell(index + i, 1).value = value.name;
        }
        index += value.capacity;
    });

    //loops through all actions and fills excel sheet
    for (let i = 0; i < scheduledActions.length; i++) {
        let currentAction = scheduledActions[i]

        //gets row (resource) in which action has to be written
        const resourceForActivity = currentAction.resource;
        let rowIndex: number | null = null;
        worksheet2.eachRow((row, rowNumber) => {
            if (row.getCell(1).value === resourceForActivity?.name && worksheet2.getCell(rowNumber, currentAction.start + 2).value === null && !rowIndex) {
                rowIndex = rowNumber;
            }
        });

        //writes activity and further information in cells depending on start and end date
        if (rowIndex !== null) {
            for(let i = 0; i < currentAction.capacity; i++){
                const startColumn = currentAction.start + 2;
                const endColumn = currentAction.end + 1;
                worksheet2.mergeCells(rowIndex + i, startColumn, rowIndex + i, endColumn)
                let outputListString = currentAction.outputList.map(instance => instance.dataclass.name + ' ' + instance.name).join(', ');
                worksheet2.getCell(rowIndex + i, startColumn).value = '(' + currentAction.capacity + ')' + ': ' + currentAction.activity.name + ' (' + outputListString + ')';

                worksheet2.getCell(rowIndex + i, startColumn).border = {
                    top: {style: 'thin'},
                    left: {style: 'thin'},
                    bottom: {style: 'thin'},
                    right: {style: 'thin'}
                }

                worksheet2.getCell(rowIndex + i, startColumn).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'E0E0E0'},
                };

                worksheet2.getCell(rowIndex + i, startColumn).alignment = {vertical: 'middle', horizontal: 'center'};
            }
            rowIndex = rowIndex + currentAction.capacity - 1;
        }
    }

    //styling
    worksheet2.columns.forEach(it => {
        it.border = {
            left: {style: "thick"}
        }
    });
    worksheet2.getRow(1).border = {
        bottom: {style: "thick"}
    };
    worksheet2.getCell(1, 1).border = {
        right: {style: "thick"},
        bottom: {style: "thick"}
    };
    worksheet2.getRow(1).font = {size: 14, bold: true};
    worksheet2.getColumn(1).font = {size: 14, bold: true};

    worksheet1.columns.forEach(column => {
        const lengths = column.values!.map(v => v!.toString().length);
        const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
        column.width = maxLength < 15 ? 15 : maxLength;
    });

    worksheet2.columns.forEach(column => {
        const lengths = column.values!.map(v => v!.toString().length);
        const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
        column.width = maxLength < 20 ? 20 : maxLength;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    // Create a Blob from the buffer
    return new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
};