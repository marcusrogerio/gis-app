import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import Checkbox from 'material-ui/Checkbox';
import ProgramSelect from '../program/ProgramSelect';
import ProgramStageSelect from '../program/ProgramStageSelect';
import DataItemFilters from '../dataitem/DataItemFilters';
import DataItemSelect from '../dataitem/DataItemSelect';
import DataItemStyle from '../dataitem/DataItemStyle';
import OrgUnitSelect from '../orgunits/OrgUnitSelect';
import NumberField from '../d2-ui/NumberField';
import ColorPicker from '../d2-ui/ColorPicker';


const styles = {
    body: {
        padding: 0,
    },
    title: {
        padding: '8px 16px',
        fontSize: 18,
    },
    content: {
        padding: '0 24px 16px',
        minHeight: 300,
    },
    checkbox: {
        marginTop: 24,
    },
    numberField: {
        display: 'block',
        width: 100,
    }
};


class EventDialog extends Component {

    componentDidMount() {
        const {
            program,
            programs,
            programStage,
            programStages,
            loadPrograms,
            loadProgramStages,
            dataElements,
            loadProgramStageDataElements
        } = this.props;

        // Load programs
        if (!programs) {
            loadPrograms();
        }

        // Load program stages if program is selected
        if (program && !programStages) {
            loadProgramStages(program.id);
        }

        // Load program stage data elements if program stage is selected
        if (programStage && !dataElements) {
            loadProgramStageDataElements(programStage.id);
        }
    }

    componentDidUpdate(prev) {
        const {
            program,
            programStage,
            styleDataElement,
            programStages,
            dataElements,
            optionSets,
            loadProgramStages,
            loadProgramStageDataElements,
            loadOptionSet,
            setProgramStage
        } = this.props;

        if (program) {
            if (programStages) {
                if (!programStage) {
                    if (programStages !== prev.programStages) {

                        // Select program stage if only one
                        if (programStages.length === 1) {
                            setProgramStage(programStages[0]);
                        }
                    }
                }
            } else {

                // Load program stages
                if (program !== prev.program) {
                    console.log('Load program stages');
                    loadProgramStages(program.id);
                }
            }
        }

        if (programStage) {
            if (!dataElements) {

                // Load program stage data elements
                if (programStage !== prev.programStage) {
                    loadProgramStageDataElements(programStage.id);
                }
            }
        }
    }

    render() {
        const {
            program,
            programs,
            programStage,
            programStages,
            dataElements,
            columns = [],
            rows = [],
            filters = [],
            // optionSets,
            startDate,
            endDate,
            eventClustering,
            eventPointColor,
            eventPointRadius,
            styleDataElement,
            setProgram,
            setProgramStage,
            setStyleDataElement,
            setEventClustering,
            setEventPointColor,
            setEventPointRadius,
        } = this.props;

        const orgUnits = rows.filter(r => r.dimension === 'ou')[0];
        const period = filters.filter(r => r.dimension === 'pe')[0];

        return (
            <Tabs>
                <Tab label='Data'>
                    <div style={styles.content}>
                        {programs ?
                            <ProgramSelect
                                items={programs}
                                value={program ? program.id : null}
                                onChange={setProgram}
                            />
                        : null}
                        {programStages ?
                            <ProgramStageSelect
                                items={programStages}
                                value={programStage ? programStage.id : null}
                                onChange={setProgramStage}
                            />
                        : null}
                        <div style={{ marginTop: 30 }}>
                            {period ?
                                <div>Period: {period.items[0].id}</div>
                            : null }
                            <div>Start date: {startDate}</div>
                            <div>End date: {endDate}</div>
                        </div>
                    </div>
                </Tab>
                <Tab label='Filter'>
                    <div style={styles.content}>
                        <DataItemFilters
                            dataItems={dataElements}
                            filters={columns.filter(c => c.filter)}
                        />
                    </div>
                </Tab>
                <Tab label='Organisation units'>
                    <div style={styles.content}>
                        {orgUnits ?
                            <OrgUnitSelect
                                items={orgUnits.items}
                            />
                        : null}
                    </div>
                </Tab>
                <Tab label='Style'>
                    <div style={styles.content}>
                        <Checkbox
                            label='Group nearby events (clustering)'
                            checked={eventClustering}
                            onCheck={(event, isChecked) => setEventClustering(isChecked)}
                            style={styles.checkbox}
                        />
                        <NumberField
                            label='Point radius'
                            value={eventPointRadius}
                            onChange={setEventPointRadius}
                            style={styles.numberField}
                        />
                        <div>
                            Color:
                            <ColorPicker
                                color={eventPointColor}
                                onChange={setEventPointColor}
                            />
                        </div>
                        {dataElements ?
                            <DataItemSelect
                                label='Style by data item'
                                items={dataElements.filter(d => d.optionSet)}
                                value={styleDataElement ? styleDataElement.id : null}
                                onChange={setStyleDataElement}
                            />
                        : null}
                        {styleDataElement ?
                            <DataItemStyle
                                {...styleDataElement}
                                onChange={(code, color) => console.log('onStyleChange', code, color)}
                            />
                        : null}
                    </div>
                </Tab>
            </Tabs>
        );
    }
}


export default EventDialog;