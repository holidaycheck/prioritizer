const R = require('ramda');

const metricNames = ['effort', 'weight', 'potential'];
const priorityLabelName = 'priority';

const priorityLabelIsNotSet = R.complement(R.has(priorityLabelName));

const nameValueMetricPairs = R.pipe(
    R.prop('name'),
    R.toLower,
    R.split(': ')
);

const filterMetricsByName = R.pick(R.concat([priorityLabelName], metricNames));

const prepareMetrics = R.compose(
    R.map(parseFloat),
    filterMetricsByName,
    R.fromPairs,
    R.map(nameValueMetricPairs),
    R.path(['payload', 'issue', 'labels'])
);

const allMetricsPresent = R.compose(
    R.equals(metricNames),
    R.keys
);

const shouldAddPriorityLabel = R.allPass([allMetricsPresent, priorityLabelIsNotSet]);

module.exports = (addLabel, calculatePriority, context) => {
    const addPriorityLabel = R.compose(
        addLabel.bind(null, context),
        R.concat('Priority: '),
        calculatePriority
    );

    R.when(
        shouldAddPriorityLabel,
        addPriorityLabel,
    )(prepareMetrics(context));
};
